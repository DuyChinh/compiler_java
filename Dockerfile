# Sử dụng Java và Node.js
FROM openjdk:11-jdk-slim

# Cài đặt Node.js
# RUN apt-get update && apt-get install -y curl && \
#     curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
#     apt-get install -y nodejs
# RUN apt-get update && apt-get install -y \
#     curl \
#     build-essential \
#     g++ && \
#     curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
#     apt-get install -y nodejs && \
#     apt-get clean && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    g++ \
    python3 \
    python3-pip && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép mã nguồn
COPY . .

# Cài đặt dependencies
RUN npm install

EXPOSE 3001

# Khởi động ứng dụng
CMD ["node", "app.js"]
