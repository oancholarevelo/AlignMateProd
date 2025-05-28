import React from "react";
import { Text, View, StyleSheet } from "react-native";

const DocumentRenderer = ({ content }) => {
  const renderFormattedText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith("# ")) {
        return (
          <Text key={index} style={styles.h1}>
            {line.substring(2)}
          </Text>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <Text key={index} style={styles.h2}>
            {line.substring(3)}
          </Text>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <Text key={index} style={styles.h3}>
            {line.substring(4)}
          </Text>
        );
      }

      // Handle bullet points
      if (line.startsWith("- ")) {
        return (
          <View key={index} style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line.substring(2)}</Text>
          </View>
        );
      }

      // Handle bold text (markdown **text**)
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <Text key={partIndex} style={styles.bold}>
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }

      // Handle italic text (markdown *text*)
      if (line.includes("*") && !line.startsWith("*Last updated:")) {
        return (
          <Text key={index} style={styles.italic}>
            {line}
          </Text>
        );
      }

      // Handle last updated line
      if (line.startsWith("*Last updated:")) {
        return (
          <Text key={index} style={styles.lastUpdated}>
            {line}
          </Text>
        );
      }

      // Handle empty lines
      if (line.trim() === "") {
        return <View key={index} style={styles.spacing} />;
      }

      // Regular paragraph
      return (
        <Text key={index} style={styles.paragraph}>
          {line}
        </Text>
      );
    });
  };

  return <View style={styles.container}>{renderFormattedText(content)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B1212",
    marginBottom: 16,
    marginTop: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B1212",
    marginBottom: 12,
    marginTop: 20,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B1212",
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1B1212",
    marginBottom: 12,
    textAlign: "justify",
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 16,
  },
  bullet: {
    fontSize: 14,
    color: "#5CA377",
    marginRight: 8,
    fontWeight: "bold",
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1B1212",
    flex: 1,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
    color: "#1B1212",
  },
  italic: {
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 8,
    textAlign: "center",
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  spacing: {
    height: 8,
  },
});

export default DocumentRenderer;
