#build stage
FROM node:24 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

#security scan
RUN npm audit --json > /tmp/audit-report.json || true
RUN npm audit --audit-level=critical

COPY . .
RUN npm run build

#production stage
FROM node:24-alpine AS production
WORKDIR /app

RUN npm install -g serve
COPY --from=builder /app/build ./build

#copy the audit report from build stage
COPY --from=builder /tmp/audit-report.json ./audit-report.json

EXPOSE 3000
CMD ["sh", "-c", "cp audit-report.json /app/reports/npm-audit-$(date +%Y%m%d-%H%M%S).json && serve -s build -l 3000"]

#still need to be able to view audit reports