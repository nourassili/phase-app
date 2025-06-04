export default function prettifySectionName(name: string): string {
  const parts = name.split("_");

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } else {
    const capitalized = parts.map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1)
    );

    if (capitalized.length > 3) {
      return `${capitalized[0]} ${capitalized[1]} ... ${
        capitalized[capitalized.length - 1]
      }`;
    } else {
      return capitalized.join(" ");
    }
  }
}
