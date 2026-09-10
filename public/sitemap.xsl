<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap | JustGST - GST Billing &amp; Inventory Software</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 32px 16px;
          }
          .container {
            max-width: 1080px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          .header {
            padding: 24px 32px;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
          }
          .header h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 700;
          }
          .header p {
            margin: 0;
            font-size: 13px;
            color: #e0f2fe;
          }
          .header a {
            color: #ffffff;
            font-weight: 600;
            text-decoration: underline;
          }
          .stats {
            padding: 16px 32px;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
            color: #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .stats strong {
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            padding: 12px 24px;
            border-bottom: 1px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
          }
          td {
            padding: 12px 24px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: #f8fafc;
          }
          a.url-link {
            color: #0284c7;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }
          a.url-link:hover {
            text-decoration: underline;
            color: #0369a1;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
          }
          .badge-high {
            background-color: #ecfdf5;
            color: #047857;
          }
          .badge-med {
            background-color: #eff6ff;
            color: #1d4ed8;
          }
          .badge-std {
            background-color: #f1f5f9;
            color: #475569;
          }
          .footer {
            padding: 16px 32px;
            background: #ffffff;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JustGST XML Sitemap</h1>
            <p>Generated for search engines (Google, Bing, Perplexity, AI Crawlers) and indexed for <a href="https://justgst.in/">JustGST.in</a>.</p>
          </div>
          <div class="stats">
            <div>Total Indexed URLs: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></div>
            <div>Format: <strong>Sitemaps.org 0.9 XML</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55%;">URL / Location</th>
                <th style="width: 15%;">Priority</th>
                <th style="width: 15%;">Change Frequency</th>
                <th style="width: 15%;">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}" class="url-link">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:variable name="pVal" select="sitemap:priority"/>
                    <xsl:choose>
                      <xsl:when test="$pVal &gt;= 0.9">
                        <span class="badge badge-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="$pVal &gt;= 0.7">
                        <span class="badge badge-med"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="badge badge-std"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td>
                    <span style="color: #64748b; font-size: 12px; text-transform: capitalize;">
                      <xsl:value-of select="sitemap:changefreq"/>
                    </span>
                  </td>
                  <td>
                    <span style="color: #64748b; font-size: 12px;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            JustGST — Simple, Fast 100% Cloud GST Billing &amp; Inventory Software for Indian Businesses.
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
