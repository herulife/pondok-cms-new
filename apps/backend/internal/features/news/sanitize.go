package news

import (
	"html"
	"net/url"
	"strings"

	xhtml "golang.org/x/net/html"
)

var allowedNewsTags = map[string]bool{
	"p":          true,
	"br":         true,
	"strong":     true,
	"em":         true,
	"b":          true,
	"i":          true,
	"u":          true,
	"ul":         true,
	"ol":         true,
	"li":         true,
	"blockquote": true,
	"h1":         true,
	"h2":         true,
	"h3":         true,
	"h4":         true,
	"h5":         true,
	"h6":         true,
	"a":          true,
}

var blockedNewsTags = map[string]bool{
	"script":   true,
	"style":    true,
	"iframe":   true,
	"object":   true,
	"embed":    true,
	"svg":      true,
	"math":     true,
	"form":     true,
	"input":    true,
	"button":   true,
	"textarea": true,
	"select":   true,
	"option":   true,
	"meta":     true,
	"link":     true,
	"base":     true,
	"head":     true,
}

func sanitizeNewsHTML(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}

	root, err := xhtml.Parse(strings.NewReader("<div>" + trimmed + "</div>"))
	if err != nil {
		return html.EscapeString(trimmed)
	}

	container := findContainer(root)
	if container == nil {
		return html.EscapeString(trimmed)
	}

	var b strings.Builder
	for child := container.FirstChild; child != nil; child = child.NextSibling {
		writeSanitizedNewsNode(&b, child)
	}

	return strings.TrimSpace(normalizeNewsBreaks(b.String()))
}

func sanitizeNewsModel(n *News) {
	if n == nil {
		return
	}

	n.Content = sanitizeNewsHTML(n.Content)
	n.Excerpt = sanitizeNewsHTML(n.Excerpt)
}

func sanitizeNewsList(items []News) {
	for i := range items {
		sanitizeNewsModel(&items[i])
	}
}

func findContainer(root *xhtml.Node) *xhtml.Node {
	var walk func(*xhtml.Node) *xhtml.Node
	walk = func(node *xhtml.Node) *xhtml.Node {
		if node.Type == xhtml.ElementNode && node.Data == "div" {
			return node
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			if found := walk(child); found != nil {
				return found
			}
		}
		return nil
	}

	return walk(root)
}

func writeSanitizedNewsNode(b *strings.Builder, node *xhtml.Node) {
	switch node.Type {
	case xhtml.TextNode:
		b.WriteString(html.EscapeString(node.Data))
	case xhtml.ElementNode:
		tag := strings.ToLower(node.Data)
		if blockedNewsTags[tag] {
			return
		}

		if tag == "br" {
			b.WriteString("<br>")
			return
		}

		if !allowedNewsTags[tag] {
			for child := node.FirstChild; child != nil; child = child.NextSibling {
				writeSanitizedNewsNode(b, child)
			}
			return
		}

		b.WriteByte('<')
		b.WriteString(tag)
		if tag == "a" {
			if href, ok := sanitizedHref(node.Attr); ok {
				b.WriteString(` href="`)
				b.WriteString(html.EscapeString(href))
				b.WriteString(`" rel="noopener noreferrer"`)
			}
		}
		b.WriteByte('>')

		for child := node.FirstChild; child != nil; child = child.NextSibling {
			writeSanitizedNewsNode(b, child)
		}

		b.WriteString("</")
		b.WriteString(tag)
		b.WriteByte('>')
	}
}

func sanitizedHref(attrs []xhtml.Attribute) (string, bool) {
	for _, attr := range attrs {
		if !strings.EqualFold(attr.Key, "href") {
			continue
		}

		value := strings.TrimSpace(attr.Val)
		if value == "" {
			return "", false
		}

		parsed, err := url.Parse(value)
		if err != nil {
			return "", false
		}

		if parsed.Scheme == "" || parsed.Scheme == "http" || parsed.Scheme == "https" || parsed.Scheme == "mailto" {
			return value, true
		}

		return "", false
	}

	return "", false
}

func normalizeNewsBreaks(raw string) string {
	replacer := strings.NewReplacer(
		"</p><p>", "</p>\n<p>",
		"</li><li>", "</li>\n<li>",
		"<br><br>", "<br>\n<br>",
	)
	return replacer.Replace(raw)
}
