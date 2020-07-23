import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.*;

public class TasckatActionTestCase {

  @Test
  public void test_when_creds_are_missing_then_throw_NoCredentialsError()
    throws IOException, InterruptedException {
    ProcessBuilder pBuilder = new ProcessBuilder(
      "act",
      "--job",
      "taskcat",
      "--directory",
      "./src/test/resources/default/"
    );
    pBuilder.redirectErrorStream(true);
    Process process = pBuilder.start();

    // Prevent the "java.lang.IllegalThreadStateException: process hasn't exited"
    // exception from being thrown.
    process.waitFor(15, TimeUnit.MINUTES);

    String output = new BufferedReader(
      new InputStreamReader(process.getInputStream())
    )
      .lines()
      .collect(Collectors.joining("\n"));

    assertThat(
      output,
      containsString("NoCredentialsError Unable to locate credentials")
    );

    Assert.assertEquals(1, process.exitValue());
  }

  @Test
  public void test_when_creds_are_available_then_create_cfn()
    throws IOException, InterruptedException {

    String awsAccessKeyId = System.getProperty("awsAccessKeyId");
    String awsSecretAccessKey = System.getProperty("awsSecretAccessKey");

    ProcessBuilder pBuilder = new ProcessBuilder(
      "act",
      "--job",
      "taskcat",
      "--directory",
      "./src/test/resources/default/",
      "--secret",
      "AWS_ACCESS_KEY_ID=" + awsAccessKeyId,
      "--secret",
      "AWS_SECRET_ACCESS_KEY=" + awsSecretAccessKey
    );
    pBuilder.redirectErrorStream(true);
    Process process = pBuilder.start();

    // Prevent the "java.lang.IllegalThreadStateException: process hasn't exited"
    // exception from being thrown.
    process.waitFor(15, TimeUnit.MINUTES);

    String output = new BufferedReader(
      new InputStreamReader(process.getInputStream())
    )
      .lines()
      .collect(Collectors.joining("\n"));

    assertThat(
      output,
      containsString("CREATE_COMPLETE")
    );

    Assert.assertEquals(0, process.exitValue());
  }

  @Test
  public void test_when_no_commands_then_print_help()
    throws IOException, InterruptedException {

    ProcessBuilder pBuilder = new ProcessBuilder(
      "act",
      "--job",
      "taskcat",
      "--directory",
      "./src/test/resources/help/"
    );
    pBuilder.redirectErrorStream(true);
    Process process = pBuilder.start();

    // Prevent the "java.lang.IllegalThreadStateException: process hasn't exited"
    // exception from being thrown.
    process.waitFor(15, TimeUnit.MINUTES);

    String output = new BufferedReader(
      new InputStreamReader(process.getInputStream())
    )
      .lines()
      .collect(Collectors.joining("\n"));

    assertThat(
      output,
      containsString("taskcat is a tool that tests AWS CloudFormation templates.")
    );

    Assert.assertEquals(0, process.exitValue());
  }
}
