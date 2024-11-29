1) ## Build `docker compose build`

2) ## Run `docker compose up -d`

3) ## Open `localhost:5000/api`

## If you have any changes need to down and build again images and containers  
4) ## Down docker container and images `docker compose down`

Make .env file from .env.example

```shell
cp .env.example .env
```

1. make mongo db and add MONGO_DSN to .env
2. add your email credentials to .env
3. add your JWT_SECRET