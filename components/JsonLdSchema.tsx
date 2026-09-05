type SchemaData = Record<string, unknown>;

export function JsonLdSchema({ data }: { data: SchemaData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
