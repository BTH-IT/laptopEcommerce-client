## Hướng dẫn setup:
Clone github -> Ctrl + J -> Gõ lệnh: npm i -> npm run dev

### Phân công làm đồ án:
#### Bùi Trọng Tân:
- Trang home (index.html)
- Trang login (login.html), register (register.html)
- Layout header, footer, slider cho các trang
- Các chức năng của các trang trên
- Hổ trợ responsive, testing trang manager.html và trang search.html
- [Giao diện các trang](https://www.youtube.com/watch?v=yhZoDaRvMKU)

#### Nguyễn Phúc Huy:
- Trang product detail (product-detail.html)
- Trang history (history.html)
- Trang cart (cart.html)
- Các chức năng của các trang trên
- Hổ trợ responsive, testing trang manager.html và trang search.html
- [Giao diện các trang](https://www.youtube.com/watch?v=CSpDKQVtL-0)

#### Biện Thành Hưng:
- Trang search (search.html)
- Trang manager (manager.html)
- Các chức năng của các trang trên
- Hổ trợ các thành viên trong team

### Giao diện các trang
[Giao diện các trang](https://youtu.be/FE4VlYgMTtw)

### File yêu cầu:
[File yêu cầu](https://drive.google.com/file/d/1R2tvxt6AeK8oCwhFeB8jQKgGwn1vFdWv/view?usp=sharing)

### Link fontawesome icon (head section)
<script src="https://kit.fontawesome.com/10c30652a2.js" crossorigin="anonymous"></script>

### Các thư viện được sử trong đồ án (đọc document - url trước để biết cách sử dụng)
- Fontawesome: [Fontawesome](https://fontawesome.com/icons)
- Jquery: [Jquery](https://www.w3schools.com/jquery/jquery_ref_overview.asp)
- Bootstrap v5.3: [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- Moment JS: [Moment](https://momentjs.com/): giúp format thời gian từ milliseconds sang string
- Date range picker: [Date range picker](https://www.daterangepicker.com/): giúp chọn thời gian trong khoảng nào đó
- Apexcharts JS: [Apexcharts JS](https://apexcharts.com/javascript-chart-demos/): tạo chart
- Slick JS: [Slick JS](https://kenwheeler.github.io/slick/): tạo slider
- Axios API: [Axios](https://github.com/axios/axios): call API
- JWT-Encode: [JWT-Encode](https://www.npmjs.com/package/jwt-encode)

### INPUT & SELECT HTML
<div class="select_container">
  <label for="gender-employee-create" class="label">Giới tính</label>
  <div class="select">
    <select name="" id="gender-employee-create" rules="required">
      <option value="" hidden selected>Chọn giới tính</option>
      <option value="1">Nam</option>
      <option value="0">Nữ</option>
    </select>
  </div>
  <span class="text-danger mb-1 error"></span>
</div>
<div class="input_container">
  <label for="salary-employee-create" class="label">Mức lương</label>
  <div class="input">
    <input
      id="salary-employee-create"
      type="text"
      placeholder="Mức lương..."
      rules="required|positive"
    />
    VNĐ
  </div>
  <span class="text-danger mb-1 error"></span>
</div>