# Bot



## Docker

### Build

```bash
  set DOCKER_BUILDKIT=1 && docker buildx build  --progress=plain -t bot --no-cache .
```

```bash
docker run -dp 3000:3000 bot
```