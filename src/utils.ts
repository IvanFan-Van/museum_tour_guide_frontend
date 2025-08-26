/**
 * 清理 markdown 语法
 * @param markdown
 * @returns
 */
export function cleanMarkdownText(markdown: string): string {
    let text: string = markdown;

    // 1. 移除表情符号（Unicode 范围覆盖常见 emoji）
    text = text.replace(
        /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+/gu,
        ""
    );

    // 2. 移除 Markdown 图像链接 ![caption](url)，包括 caption 和 URL
    text = text.replace(/!\[.*?\]\(.*?\)/g, "");

    // 3. 保留 Markdown 链接 [text](url) 中的 text
    text = text.replace(/\[([^\]]*)\]\(.*?\)/g, "$1");

    // 4. 移除加粗 **text** 或 __text__
    text = text.replace(/(?:\*\*|__)(.*?)(?:\*\*|__)/g, "$1");

    // 5. 移除斜体 *text* 或 _text_
    text = text.replace(/(?:\*|_)(.*?)(?:\*|_)/g, "$1");

    // 6. 移除标题 #, ##, ### 等
    text = text.replace(/^\s*#{1,6}\s*(.*)$/gm, "$1");

    // 7. 移除代码块 ```code``` 或 `code`
    text = text.replace(/```[\s\S]*?```/g, ""); // 移除多行代码块
    text = text.replace(/`([^`]+)`/g, "$1"); // 移除内联代码

    // 8. 移除列表标记 -、*、+ 或 1.、2. 等
    text = text.replace(/^\s*[-*+]\s*(.*)$/gm, "$1");
    text = text.replace(/^\s*\d+\.\s*(.*)$/gm, "$1");

    // 9. 移除 HTML 标签（如 <img>, <p> 等）
    text = text.replace(/<[^>]+>/g, "");

    // 10. 清理多余的换行和空格
    text = text.replace(/\n{2,}/g, "\n"); // 多个换行合并为一个
    text = text.replace(/^\s+|\s+$/gm, ""); // 移除每行首尾空格
    text = text.trim(); // 移除文本首尾空格

    return text;
}

/**
 * 将大段文本根据 minLength 以及 maxLength 划分成小段文本
 * @param text
 * @param minLength
 * @param maxLength
 * @returns
 */
export function segment(
    text: string,
    minLength: number,
    maxLength: number = minLength * 3
): string[] {
    const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
    let sentences: string[] = Array.from(segmenter.segment(text), (s) =>
        s.segment.trim()
    ).filter((s) => s.length > 0);

    while (true) {
        // Find short sentences
        const shortItems: { len: number; i: number }[] = sentences
            .map((s, i) => ({ len: s.length, i }))
            .filter(({ len }) => len < minLength);

        if (shortItems.length === 0) {
            break;
        }

        // Sort by length ascending to process the shortest first
        shortItems.sort((a, b) => a.len - b.len);
        let idx = shortItems[0].i; // Index of the current shortest

        // Try to merge with right if possible
        if (idx < sentences.length - 1) {
            const merged = sentences[idx] + " " + sentences[idx + 1];
            if (merged.length <= maxLength) {
                sentences[idx] = merged;
                sentences.splice(idx + 1, 1);
                continue;
            }
        }

        // Otherwise, try to merge with left if possible
        if (idx > 0) {
            const merged = sentences[idx - 1] + " " + sentences[idx];
            if (merged.length <= maxLength) {
                sentences[idx - 1] = merged;
                sentences.splice(idx, 1);
                continue;
            }
        }
        // If cannot merge this one (would exceed maxLength), proceed to next shortest or break to avoid loop
        // Here, we break if the shortest cannot be merged, assuming others might be mergable but to prevent infinite loop
        break;
    }

    return sentences;
}
