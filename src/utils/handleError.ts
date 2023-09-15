export default function handleError(
  err: unknown,
  title: string,
  shouldBubble = true
) {
  const error = err as ReferenceError;

  const originalError = JSON.stringify(error);

  console.error(
    `${title || 'Unknown error'}: ${error?.message}`,
    originalError
  );

  if (shouldBubble) {
    throw error;
  }
}
