# Sử dụng Java và Node.js
FROM openjdk:11-jdk-slim

# Cài đặt Node.js
# RUN apt-get update && apt-get install -y curl && \
#     curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
#     apt-get install -y nodejs

RUN apt-get update && apt-get install -y curl && \
curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
apt-get install -y nodejs && \
apt-get clean
# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép mã nguồn
COPY . .

# Cài đặt dependencies
# add
COPY package*.json ./ 
RUN npm install

# EXPOSE 3001
EXPOSE 3000

# Khởi động ứng dụng
CMD ["node", "app.js"]
