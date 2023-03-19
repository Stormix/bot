# Tex


A simple Interpreted Dynamic Programming Language for describing chat bot commands and behavior... now in typescript! (Inspired by [Bex](https://gitlab.com/tsoding/bex))

P.S: Still needs a lot of work, but it's a start. Huge thanks to [tsoding](https://www.twitch.tv/tsoding)!

## Installation

```
pnpm install
```

## Usage

To compile:

```bash
pnpm run exec <filename.bot>
```
For example:

```bash
pnpm run exec examples/weather.bot
```
Should output:

```bash
Hello Anas from Marseille! Here is the weather in Marseille: ☀️ 🌡️+14°C 🌬️↖20km/h
```

## Language Elements

### String

```
"Hello, World"
```

### Integer

```
69
420
```

### Variable

```
args
sender
```

### Funcalls

```
f()
f(g())
f(69, 420)
f("hello, world")
```


