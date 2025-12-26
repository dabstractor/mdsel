/**
 * File and stdin reading utilities for CLI.
 *
 * @module cli/utils/file-reader
 */

/**
 * Check if stdin has piped input.
 *
 * @returns True if stdin is piped (not a TTY)
 */
export function isStdinPiped(): boolean {
  return !process.stdin.isTTY;
}

/**
 * Read all content from stdin.
 *
 * @returns Promise resolving to stdin content as UTF-8 string
 *
 * @example
 * ```typescript
 * if (isStdinPiped()) {
 *   const content = await readStdin();
 *   // Process content...
 * }
 * ```
 */
export function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk: string | Buffer) => {
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk, 'utf8'));
      } else {
        chunks.push(chunk);
      }
    });

    process.stdin.on('end', () => {
      const content = Buffer.concat(chunks).toString('utf8');
      resolve(content);
    });

    process.stdin.on('error', (error: Error) => {
      reject(error);
    });
  });
}
