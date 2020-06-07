import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;
import org.junit.*;

public class TasckatActionTestCase {

  @Test
  public void test_when_creds_are_missing_then_throw_NoCredentialsError()
    throws IOException {
    ProcessBuilder pBuilder = new ProcessBuilder(
      "act",
      "--job",
      "taskcat",
      "--directory",
      "./src/test/resources/default/"
    );
    pBuilder.redirectErrorStream(true);
    Process process = pBuilder.start();

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
}
