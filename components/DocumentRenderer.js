import React from "react";
import { Text, View, StyleSheet, Linking, TouchableOpacity } from "react-native";

const DocumentRenderer = ({ content }) => {
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  // Helper function to render text with bold formatting
  const renderTextWithBold = (text, baseStyle) => {
    if (!text.includes("**")) {
      return <Text style={baseStyle}>{text}</Text>;
    }

    const parts = text.split("**");
    return (
      <Text style={baseStyle}>
        {parts.map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <Text key={partIndex} style={[baseStyle, styles.bold]}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  const renderFormattedText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith("# ")) {
        return (
          <View key={index} style={styles.h1Container}>
            <Text style={styles.h1}>
              {line.substring(2)}
            </Text>
            <View style={styles.h1Underline} />
          </View>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <View key={index} style={styles.h2Container}>
            <Text style={styles.h2}>
              {line.substring(3)}
            </Text>
          </View>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <View key={index} style={styles.h3Container}>
            {renderTextWithBold(line.substring(4), styles.h3)}
          </View>
        );
      }

      // Handle bullet points with bold text support
      if (line.startsWith("- ")) {
        return (
          <View key={index} style={styles.bulletContainer}>
            <View style={styles.bulletPoint} />
            {renderTextWithBold(line.substring(2), styles.bulletText)}
          </View>
        );
      }

      // Handle links (markdown [text](url) or just URLs)
      if (line.includes("http")) {
        const urlRegex = /(https?:\/\/[^\s)]+)/g;
        const parts = line.split(urlRegex);
        
        return (
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, partIndex) => {
              if (part.match(urlRegex)) {
                return (
                  <TouchableOpacity
                    key={partIndex}
                    onPress={() => handleLinkPress(part)}
                    style={styles.linkContainer}
                  >
                    <Text style={styles.link}>{part}</Text>
                  </TouchableOpacity>
                );
              }
              return renderTextWithBold(part, styles.paragraph);
            })}
          </Text>
        );
      }

      // Handle important notices (lines that start with "Important:")
      if (line.includes("**Important**") || line.startsWith("**Important")) {
        return (
          <View key={index} style={styles.importantNotice}>
            {renderTextWithBold(line, styles.importantText)}
          </View>
        );
      }

      // Handle contact information sections (lines with Email:, Institution:, etc.)
      if (line.includes("**Email**:") || line.includes("**Students**:") || 
          line.includes("**Advisor**:") || line.includes("**Institution**:") ||
          line.includes("**Department**:")) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const labelPart = line.substring(0, colonIndex + 1);
          const valuePart = line.substring(colonIndex + 1).trim();
          
          return (
            <View key={index} style={styles.contactItem}>
              {renderTextWithBold(labelPart, styles.contactLabel)}
              <Text style={styles.contactValue}>{valuePart}</Text>
            </View>
          );
        }
      }

      // Handle "We DO NOT:" and "We MAY:" sections
      if (line.includes("### We DO NOT:") || line.includes("### We MAY:")) {
        return (
          <View key={index} style={styles.emphasisContainer}>
            <Text style={styles.emphasisText}>
              {line.substring(4)}
            </Text>
          </View>
        );
      }

      // Handle disclaimer sections
      if (line.includes("Disclaimer") || line.includes("Academic Use Only") ||
          line.includes("Thesis Project")) {
        return (
          <View key={index} style={styles.disclaimerContainer}>
            {renderTextWithBold(line.replace(/\*/g, ""), styles.disclaimerText)}
          </View>
        );
      }

      // Handle last updated line with improved styling
      if (line.startsWith("*Last updated:")) {
        return (
          <View key={index} style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdated}>
              {line.replace(/\*/g, "")}
            </Text>
          </View>
        );
      }

      // Handle italic text (markdown *text*) but not bold
      if (line.startsWith("*") && line.endsWith("*") && !line.includes("Last updated") && !line.includes("**")) {
        return (
          <Text key={index} style={styles.italic}>
            {line.replace(/\*/g, "")}
          </Text>
        );
      }

      // Handle empty lines
      if (line.trim() === "") {
        return <View key={index} style={styles.spacing} />;
      }

      // Regular paragraph with bold text support
      return (
        <View key={index} style={styles.paragraphContainer}>
          {renderTextWithBold(line, styles.paragraph)}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.documentContent}>
        {renderFormattedText(content)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  documentContent: {
    backgroundColor: "#FFFFFF",
    margin: 0, // Changed from 16 to 0
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  h1Container: {
    marginBottom: 20,
    marginTop: 8,
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B1212",
    textAlign: "center",
    marginBottom: 8,
  },
  h1Underline: {
    height: 3,
    backgroundColor: "#5CA377",
    width: "50%",
    alignSelf: "center",
    borderRadius: 2,
  },
  h2Container: {
    marginTop: 24,
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#5CA377",
    backgroundColor: "#F0F8F4",
    paddingVertical: 8,
    borderRadius: 4,
  },
  h2: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B1212",
  },
  h3Container: {
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D4A",
    marginBottom: 4,
  },
  paragraphContainer: {
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333333",
    textAlign: "justify",
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 20,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5CA377",
    marginRight: 12,
    marginTop: 9,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333333",
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
    marginBottom: 12,
    textAlign: "center",
  },
  importantNotice: {
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
  importantText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8B4513",
    textAlign: "center",
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 12,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D4A",
    minWidth: 100,
  },
  contactValue: {
    fontSize: 15,
    color: "#333333",
    flex: 1,
    marginLeft: 8,
  },
  emphasisContainer: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5CA377",
  },
  emphasisText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D4A",
    textAlign: "center",
  },
  disclaimerContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DEE2E6",
    alignItems: "center",
  },
  disclaimerText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 20,
  },
  lastUpdatedContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6",
    alignItems: "center",
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#6C757D",
    textAlign: "center",
  },
  linkContainer: {
    display: "inline",
  },
  link: {
    color: "#5CA377",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  spacing: {
    height: 12,
  },
});

export default DocumentRenderer;