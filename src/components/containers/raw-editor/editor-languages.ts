import { Parser } from '@lezer/common';
import {
  LanguageName,
  langs,
  loadLanguage,
} from '@uiw/codemirror-extensions-langs';

const supportedLanguages: LanguageName[] = [
  'angular',
  'c',
  'clojure',
  'commonLisp',
  'cpp',
  'css',
  'dart',
  'go',
  'java',
  'javascript',
  'json',
  'kotlin',
  'mysql',
  'php',
  'python',
  'sass',
  'sql',
  'shell',
  'dockerfile',
  'r',
  'toml',
  'ruby',
  'rust',
  'html',
  'csharp',
  'scala',
];

supportedLanguages.forEach((lang) => loadLanguage(lang));

export const editorLanguages: { [langName: string]: Parser } = {
  'web-mode': langs.vue().language.parser,
  java: langs.java().language.parser,
  'c++': langs.cpp().language.parser,
  c: langs.cpp().language.parser,
  cpp: langs.cpp().language.parser,
  rust: langs.rust().language.parser,
  javascript: langs.javascript().language.parser,
  js: langs.javascript().language.parser,
  typescript: langs.typescript().language.parser,
  ts: langs.typescript().language.parser,
  json: langs.json().language.parser,
  clojure: langs.clojure().language.parser,
  'common-lisp': langs.commonLisp().parser,
  'emacs-lisp': langs.commonLisp().parser,
  css: langs.css().language.parser,
  dart: langs.dart().parser,
  go: langs.go().parser,
  html: langs.html().language.parser,
  kotlin: langs.kotlin().parser,
  mysql: langs.mysql().language.parser,
  csharp: langs.csharp().language.parser,
  r: langs.r().parser,
  ruby: langs.ruby().parser,
  sass: langs.sass().language.parser,
  scala: langs.scala().parser,
  shell: langs.shell().parser,
  sql: langs.sql().language.parser,
  toml: langs.toml().parser,
  dockerfile: langs.dockerfile().parser,
  php: langs.php().language.parser,
  python: langs.python().language.parser,
  angular: langs.angular().language.parser,
  vue: langs.vue().language.parser,
};
