import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LetterDocument } from "./types";

// Same restraint rule as CvPdf: rose (#f20c78) only on the heading rule,
// body copy stays near-black/muted. Built-in Helvetica, A4, single column.
const INK = "#18181b";
const MUTED = "#6f6f75";
const ROSE = "#f20c78";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
  },
  heading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ROSE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  headingUnderline: {
    marginBottom: 20,
    height: 2,
    width: 64,
    backgroundColor: ROSE,
  },
  paragraph: {
    fontSize: 10,
    color: INK,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  signoff: {
    marginTop: 12,
    fontSize: 10,
    color: INK,
  },
  signoffMuted: {
    fontSize: 10,
    color: MUTED,
  },
});

export function LetterPdf({ doc }: { doc: LetterDocument }) {
  return (
    <Document title={`Cover letter — ${doc.recipientCompany}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Cover letter · {doc.recipientCompany}</Text>
        <View style={styles.headingUnderline} />
        {doc.paragraphs.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
        <Text style={styles.signoffMuted}>Sincerely,</Text>
        <Text style={styles.signoff}>{doc.signoffName}</Text>
      </Page>
    </Document>
  );
}

export default LetterPdf;
