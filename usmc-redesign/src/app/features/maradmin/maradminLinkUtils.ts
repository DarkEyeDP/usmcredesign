function normalizeUrlLikeChunk(chunk: string): string {
  return chunk
    .replace(/https[^A-Za-z0-9]{0,20}www/gi, 'https://www')
    .replace(/http[^A-Za-z0-9]{0,20}www/gi, 'http://www')
    .replace(/https?\s*:\s*\(slash\)\s*\(slash\)\s*/gi, 'https://')
    .replace(/http\s*:\s*\(slash\)\s*\(slash\)\s*/gi, 'http://')
    .replace(/https?\s*:\s*\(slash\)\s*slash\)\s*/gi, 'https://')
    .replace(/http\s*:\s*\(slash\)\s*slash\)\s*/gi, 'http://')
    .replace(/https?\s*:\s*\(slash\)\s+\(slash\)\s*/gi, 'https://')
    .replace(/http\s*:\s*\(slash\)\s+\(slash\)\s*/gi, 'http://')
    .replace(/https?\s*:\s*\(slash\(slash\)\s*/gi, 'https://')
    .replace(/http\s*:\s*\(slash\(slash\)\s*/gi, 'http://')
    .replace(/\(\s*slash\s*\)/gi, '/')
    .replace(/\bslash\)/gi, '/')
    .replace(/\(slash\b/gi, '/')
    .replace(/https?:\s*(?:\/|\(slash\)|slash\))\s*(?:\/|\(slash\)|slash\))\s*/gi, 'https://')
    .replace(/http:\s*(?:\/|\(slash\)|slash\))\s*(?:\/|\(slash\)|slash\))\s*/gi, 'http://')
    .replace(/https?:\(slash\(slash\)/gi, 'https://')
    .replace(/http:\(slash\(slash\)/gi, 'http://')
    .replace(/https?:\/\s*\/\s*/gi, 'https://')
    .replace(/https?:\/\s*(?:\(?slash\)?|\bslash\b)\s*/gi, 'https://')
    .replace(/\(slash\(slash\)/gi, '//')
    .replace(/\(slash\)/gi, '/')
    .replace(/(https?:\/\/[^\s]+)\s*\/\s*([A-Za-z0-9_/?#=&.%+-]+)/g, '$1/$2')
    .replace(/(https?:\/\/[^\s]+)\.\s*([A-Za-z0-9_/?#=&%-]+)/g, '$1.$2')
    .replace(/(https?:\/\/[^\s]+)\?\s*([A-Za-z0-9_#=&.-]+)/g, '$1?$2')
    .replace(/(https?:\/\/[^\s]+)\s+(\?[A-Za-z0-9_#=&.-]+)/g, '$1$2')
    .replace(/(https?:\/\/[^\s]+\/)\s+([A-Za-z0-9_/?#=&.%+-]+)/g, '$1$2')
    .replace(/(https?:\/\/[^\s]+\.)\s+([A-Za-z0-9_/?#=&.%+-]+)/g, '$1$2')
    .replace(/(https?:\/\/\S+?)-[ \t]+(\w)/g, '$1-$2')
    .replace(/(https?:\/\/\S+?\/)[ \t]+(\w)/g, '$1$2');
}

export function fixSpelledOutURLs(text: string): string {
  return normalizeUrlLikeChunk(text);
}
