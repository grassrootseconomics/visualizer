// pages/_document.js
import NextDocument, {Html, Head, Main, NextScript} from 'next/document'
export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en" className="dark dark:bg-gray-800 dark:text-white bg-gray-800 text-white">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}