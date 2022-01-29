export function parseSelectorString(selector: string): { selector?: string, attribute?: string, transforms: string[] } {
  const transforms = selector.split(/\s*\|(?!=)\s*/);
  const selectorsAndAttribute = transforms.shift();
  if (!selectorsAndAttribute) return { transforms };
  const match = selectorsAndAttribute.match(/^([^@]*)(?:@\s*([\w-_:]+))?$/) || [];

  return {
    selector: match[1] ? match[1].trim() : match[1],
    attribute: match[2],
    transforms
  };
}

