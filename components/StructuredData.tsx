interface StructuredDataProps {
  data: object | object[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Keep JSON-LD in the server HTML and prevent data from closing the tag.
            __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
