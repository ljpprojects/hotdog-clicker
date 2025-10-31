export const htmlTagRegex = /<[^>]+>/gm;

export const conatainsHtml = (str: string) => htmlTagRegex.test(str);
