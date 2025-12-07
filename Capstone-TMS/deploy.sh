echo "Building app..."
npm run build

echo "Deploying files to server..."
# Thay 1.2.3.4 bằng IP VPS của bạn
# Khi chạy lệnh này, nó sẽ hỏi mật khẩu VPS, bạn nhập vào là được
scp -r dist/* root@222.255.214.167:/var/www/ketnoitrungtam/

echo "Done!"