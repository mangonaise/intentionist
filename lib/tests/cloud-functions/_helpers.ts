export async function waitForCloudFunctionExecution(time = 2500) {
  return new Promise((resolve) => setTimeout(resolve, time))
}