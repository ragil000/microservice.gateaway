# Microservices Architecture

Ini adalah project contoh penerapan microservices architecture secara sederhana. Didalamnya telah include penerapan RPI (Remote Procedure Invocation) via RESTful API, API gateaway serta basic security pada tiap service.

Project ini terdiri dari 4 services, yaitu:
- **[Service API Gateaway](https://github.com/ragil000/microservice.gateaway)**, service ini dugunakan sebagai service utama untuk melakukan request ke service lain. Pada penerapannya, hanya service gateaway yang akan di-expose ke public. Sedangkan service lain requestnya akan dihandle oleh service gateaway ini.
- **[Service API Auth](https://github.com/ragil000/microservice.auth)**, service ini digunakan sebagai service yang melakukan handle terhadap segala proses yang berhubungan dengan autentikasi. Seperti registrasi, login dan lainnya.
- **[Service API Master](https://github.com/ragil000/microservice.master)**, service ini digunakan sebagai service yang melakukan handle terhadap data master pada aplikasi. Biasanya data ini adalah data yang sangat jarang sekali berubah, seperti kategori produk, list negara dan lainnya.
- **[Service API Storage](https://github.com/ragil000/microservice.storage)**, service ini digunakan sebagai service yang melakukan handling terhadap seluruh attachment pada aplikasi, service ini berfungsi sebagai cloud storage. Seperti menyimpan data gambar, video dan file. Biasanya developer akan menggunakan service storage dari third party. Seperti aws s3, google storage dan lainnya. Tapi untuk menekan biaya juga sebagai bahan belajar maka service storage dibuat sendiri.

# Instalation

Clone repository ini dengan perintah

    git clone https://github.com/ragil000/microservice.gateaway
Kemudian masuk kedalam direktori folder `microservice.gateaway` dan jalankan perintah

    npm install
Kemudian jalankan aplikasi dengan perintah

    node server.js
Jangan lupa untuk menjalankan service lainnya agar bisa digunakan

## License

Saya menggunakan lisensi **[ISC](https://opensource.org/licenses/ISC)**, yang artinya dibolehkan untuk melakukan clone pada project ini dan kemudian digunakan secara commercial dan atau non commercial.
