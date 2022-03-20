import { ChildProcess } from "child_process";
import { mock, mockFn } from "jest-mock-extended";
import { Readable, Writable } from "stream";
import * as net from "net";

type Serializable = string | number | boolean | bigint;
type SendHandle = net.Socket | net.Server;

/**
 * Mock of the ChildProcess class, for use in unit testing.
 *
 * @remarks
 * Instances of this class can be used to mock spawned or executed
 * {@link child_process#ChildProcess} objects.
 *
 * @example
 * ```typescript
 * const cpMock = new ChildProcessMock();
 * jest.spyOn(cpMock, "on");
 *
 * // Here, we mock the child_process module, not the class!
 * const childProcessMock = mock<ChildProcess>();
 *
 * // The spawn() function inside the child_process module returns a
 * // ChildProcess object. We configure the function to return our mocked
 * // object.
 * childProcessMock.spawn.mockReturnValue(cpMock);
 *
 * // We pass the mocked child_process module into the PostEntrypointImpl class
 * new PostEntrypointImpl(
 *      mock<Artifact>(),
 *      core,
 *      childProcessMock,
 *      mock<TaskcatArtifactManagerImpl>()
 *    ).run();
 *
 * // We test the mocked ChildProcess class against different assertions
 * expect(cpMock.on).toHaveBeenCalledWith("exit", anyFunction());
 * ```
 *
 * @privateRemarks
 * This approach was chosen because:
 * + This application heavily depends on ChildProcess, and many mocks will
 *   likely have to be created from it; manually creating our own mock class
 *   will give us the most flexibility
 *
 * + Jest has trouble mocking functions with multiple overloads. There is a way
 *   of creating it by manually defining a new type that copies the function
 *   signature we want, but it's very cumbersome.
 *
 * + While the ChildProcess class is rather large, and this class mocks out
 *   most of its implementation, that extra code is hidden away in a separate
 *   class, which makes for cleaner unit tests.
 */
export class ChildProcessMock implements ChildProcess {
  stdin: Writable = mock<Writable>();
  stdout: Readable;
  stdio: [
    Writable | null,
    Readable | null,
    Readable | null,
    Writable | Readable | null | undefined,
    Writable | Readable | null | undefined
  ] = mock<
    [
      Writable | null,
      Readable | null,
      Readable | null,
      Writable | Readable | null | undefined,
      Writable | Readable | null | undefined
    ]
  >();

  stderr: Readable;
  killed = false;
  connected = true;
  pid = 1234;
  exitCode = 1;
  signalCode = 0;
  spawnargs: string[] = [""];
  spawnfile = "";
  kill: (signal?: any) => boolean = mockFn();
  send = mockFn();
  disconnect = mockFn();
  unref = mockFn();
  ref = mockFn();
  addListener = mockFn();
  emit = mockFn();
  once = mockFn();
  prependListener = mockFn();
  prependOnceListener = mockFn();
  removeListener = mockFn();
  off = mockFn();
  removeAllListeners = mockFn();
  setMaxListeners = mockFn();
  getMaxListeners = mockFn();
  listeners = mockFn();
  rawListeners = mockFn();
  listenerCount = mockFn();
  eventNames = mockFn();

  /*
   * To define method overloads in TypeScript, we need to define all the method
   * signatures we want, followed by a single implementation that can handle
   * all forms the function can take.
   *
   * See https://bit.ly/3ARmFFg for more details on method overloading with
   * TypeScript.
   */
  on(event: string, listener: (...args: any[]) => void): this;
  on(
    event: "close",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): this;

  on(event: "disconnect", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): this;

  on(
    event: "message",
    listener: (message: Serializable, sendHandle: SendHandle) => void
  ): this;

  on(event: "spawn", listener: () => void): this;

  /*
   * This implementation simply calls the listener passed when invoking the
   * function. For the purposes of this application, these are set in the
   * `PostEntrypoint` class.
   */
  on(event: string, listener: (...args: any[]) => void): ChildProcessMock {
    if (event === "exit") listener(this.exitCode);
    return this;
  }

  /**
   * Create a new ChildProcessMock instance, and specify the exit code that
   * would have been returned by taskcat when the test is ran, depending on
   * whether we want to test a success or failure scenario.
   *
   * @param exitCode - The mock exit code that would have been returned by
   * taskcat
   *
   * @param stdout - The stdout stream used by this process. A Readable
   * object can be passed if verifying stdout behavior, or a mock one if the
   * stream is not relevant to the test.
   *
   * @param stderr - The stderr stream used by this process. A Readable
   * object can be passed if verifying stderr behavior, or a mock one if the
   * stream is not relevant to the test.
   */
  public constructor(exitCode: number, stdout: Readable, stderr: Readable) {
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  public pushMessageToStdout(message: Serializable): void {
    // Push data to the different streams. Note that we have to end the
    // stream with `null`, to let it know we're done pushing data.
    this.stdout.push(message);
    this.stdout.push(null);
  }

  public pushMessageToStderr(message: Serializable): void {
    // Push data to the different streams. Note that we have to end the
    // stream with `null`, to let it know we're done pushing data.
    this.stderr.push(message);
    this.stderr.push(null);
  }
}
