import startActionRuntime from '@template/worker-service';

export async function setUpTestEnvironment() {
  await startRuntime();
}

async function startRuntime() {
  await startActionRuntime(false);
}
