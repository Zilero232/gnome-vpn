export const emailStyles = {
  body: {
    margin: 0,
    padding: '32px 0',
    backgroundColor: '#f4efe4',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  outer: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '0 16px'
  },
  card: {
    padding: '36px 32px',
    borderRadius: '18px',
    border: '1px solid #e2d9c8',
    backgroundColor: '#ffffff'
  },
  brand: {
    margin: '0 0 24px',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: '18px',
    fontWeight: 600,
    color: '#16201c'
  },
  heading: {
    margin: '0 0 14px',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: '1.25',
    color: '#16201c'
  },
  text: {
    margin: '0 0 12px',
    fontSize: '15px',
    lineHeight: '1.65',
    color: '#3d4842'
  },
  button: {
    display: 'inline-block',
    padding: '13px 26px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
    backgroundColor: '#146b47',
    textDecoration: 'none'
  },
  hr: {
    margin: '28px 0 18px',
    border: 'none',
    borderTop: '1px dashed #d3c7b1'
  },
  footnote: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#56625b'
  },
  link: {
    color: '#146b47',
    wordBreak: 'break-all' as const
  }
} as const;
