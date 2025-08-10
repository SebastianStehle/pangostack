export async function pollUntil(timeout: number, action: () => Promise<boolean>, wait = 1000) {
  const statusStart = new Date();

  while (true) {
    let lastError: Error = null;
    try {
      if (await action()) {
        return;
      }
    } catch (ex) {
      console.log(ex);
      if (ex instanceof Error) {
        lastError = ex;
      }
    }

    const now = new Date();
    if (now.getTime() - statusStart.getTime() > timeout) {
      if (lastError) {
        throw new Error(`Timeout: Instance did not become ready within ${timeout}ms. Last error: ${lastError.message}`);
      } else {
        throw new Error(`Timeout: Instance did not become ready within ${timeout}ms.`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}
