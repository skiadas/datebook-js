# datebook-js

A tool to create a list of dates from given descriptions.

## Installation

```bash
npm i datebook
```

## Usage

```ts
import { Datebook, DateTime } from 'datebook'

const dbook = new Datebook()
  .startOn(DateTime.now()).for(3, 'times');
console.log(dbook.formatted("Day 1: %{yyyy-mm-dd}"))
// [ 'Day 1: 2025-09-22', 'Day 2: 2025-09-23', 'Day 3: 2025-09-24' ]
```
