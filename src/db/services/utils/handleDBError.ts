import { handleError } from '../../../utils';
//
export default function handleDBError(
  error: unknown,
  title: string,
  shouldBubble = true
) {
  const err = error as Record<string, unknown>;
  const errorCode = err?.code;
  // console.log({ errorCode });

  let modifiedError: Record<string, unknown> | Error = err;

  if (errorCode === 11000) {
    //mongodb unique field error
    const keyValue = err.keyValue as Record<string, unknown>;
    if (keyValue) {
      const fieldName = Object.keys(keyValue)[0];
      const value = keyValue[fieldName];

      const msg = `DB Error: '${fieldName}' must be unique! Received '${value}'`;

      modifiedError = new Error(msg);
    }
  }

  handleError(modifiedError, title, shouldBubble);
}
