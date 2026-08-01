export function decodeMojibake(val: string): string {
  if (!val || typeof val !== 'string') return val;
  
  // Check for Tamil double-encoding signature (à® or à in ISO-8859-1/cp1252)
  if (val.includes('\u00e0\u00ae') || val.includes('\u00e0\u00af')) {
    const cp1252Reverse: Record<number, number> = {
      0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84,
      0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
      0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0163: 0x8b,
      0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
      0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96,
      0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a,
      0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f
    };
    
    const bytes: number[] = [];
    for (let i = 0; i < val.length; i++) {
      const code = val.charCodeAt(i);
      if (code in cp1252Reverse) {
        bytes.push(cp1252Reverse[code]);
      } else if (code < 256) {
        bytes.push(code);
      } else {
        bytes.push(0x3f); // '?'
      }
    }
    try {
      return Buffer.from(bytes).toString('utf-8');
    } catch (e) {
      return val;
    }
  }
  return val;
}

export function cleanMojibakeRecursive(data: any): any {
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(cleanMojibakeRecursive);
    } else {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = cleanMojibakeRecursive(value);
      }
      return result;
    }
  } else if (typeof data === 'string') {
    return decodeMojibake(data);
  }
  return data;
}
