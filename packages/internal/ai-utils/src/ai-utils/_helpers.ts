import { toPascalCase } from '@template/string-utils';
import type { InstructionField, InstructionSegment } from './__defs__';

export function normalizeStringStringArray(
  input: string | string[],
  mapFn?: (curr: string, i: number) => string
): string {
  return Array.isArray(input)
    ? input.map(mapFn || ((item) => `- ${item}`)).join('\n')
    : input;
}

// TODO
export function getSegmentTransformation(
  key: InstructionSegment
): InstructionField<any> {
  const specialFields = new Map<InstructionSegment, InstructionField<any>>([
    [
      'examples',
      {
        key: 'examples',
        label: 'Examples',
        // transform: (examples) =>
        //   examples
        //     .map((example, i) =>
        //       XMLify(
        //         `Example_${i}`,
        //         example.map(({ role, text }) => `${role}: ${text}`).join("\n"),
        //       ),
        //     )
        //     .join("\n"),
      },
    ],
    [
      'outputStructure',
      {
        key: 'outputStructure',
        label: 'Output Structure',
      },
    ],
    [
      'internalNotes',
      {
        key: 'internalNotes',
        label: 'Internal Notes',
        transform: normalizeStringStringArray,
      },
    ],
  ]);

  const specialField = specialFields.get(key);

  if (specialField) {
    return specialField;
  }

  return {
    key,
    label: toPascalCase(key),
    transform: normalizeStringStringArray,
  };
}
