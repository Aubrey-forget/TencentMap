const container = document.getElementById("container");
const KEY = "AD5BZ-HMBWV-B45PP-UY6CR-RMVZ3-XWBXG";

//初始化地图函数  自定义函数名init
function init(status = 1) {
  let center = new qq.maps.LatLng(39.916527, 116.397128); // 纬度，经度,地图显示中心 骑手的位置
  let map = new qq.maps.Map(container, {
    center,
    zoom: 13 //定位范围大小
  });

  let marker = new qq.maps.Marker({
    position: center, // 纬度，经度,定位地址
    map: map
  });

  // 骑手位置
  let anchor = new qq.maps.Point(0, 0), //标记图像位置
    size = new qq.maps.Size(42, 42), //标记图像大小
    origin = new qq.maps.Point(0, 0),
    scaleSize = new qq.maps.Size(42, 42),
    markerIcon = new qq.maps.MarkerImage(
      "./images/rider.png",
      size,
      origin,
      anchor,
      scaleSize
    );

  // 收货位置
  let markerSender = new qq.maps.Marker({
    position: new qq.maps.LatLng(39.905427, 116.397128),
    map: map
  });
  sender = new qq.maps.MarkerImage(
    "./images/recipient.png",
    new qq.maps.Size(46, 46),
    origin,
    anchor,
    new qq.maps.Size(46, 46)
  );

  // 寄货位置
  let markerRecipient = new qq.maps.Marker({
    position: new qq.maps.LatLng(39.905427, 116.375128),
    map: map
  });
  recipient = new qq.maps.MarkerImage(
    "./images/sender.png",
    new qq.maps.Size(46, 46),
    origin,
    anchor,
    new qq.maps.Size(46, 46)
  );
  marker.setIcon(markerIcon);
  markerSender.setIcon(sender);
  markerRecipient.setIcon(recipient);

  // 寄件标记事件
  qq.maps.event.addListener(markerRecipient, "click", function(event) {
    const {
      latLng: { lat, lng }
    } = event;
    console.log(lat, lng);
  });

  //标记文字样式
  let cssC = {
    color: "#333",
    fontSize: "15px",
    fontWeight: "bold",
    boxShadow: "2px 6px 38px rgba(2,2,2,0.2)",
    border: "none",
    padding: "14px 20px",
    borderRadius: "5px"
  };

  let labelText, mapTextPosition;
  if (status === 0) {
    labelText = `<div class="mark-text">
                      <p>骑手正赶往您这里</p>
                      <p class="distance">距离您<span>1000m</span></p>
                      <span class="triangle_border_down"></span>
                  </div>`;
    mapTextPosition = new qq.maps.Size(-55, -80);
  } else if (status === 1) {
    labelText = `<div class="mark-text">
                      <p>骑手正在前往商家取货</p>
                      <p class="distance">距离您<span>1000m</span></p>
                      <span class="triangle_border_down position-triangle"></span>
                  </div>`;
    mapTextPosition = new qq.maps.Size(-78, -80);
  } else {
    labelText = `<div class="mark-text">
                      <p>订单已完成</p>
                      <span class="triangle_border_down position"></span>
                  </div>`;
    mapTextPosition = new qq.maps.Size(-45, -65);
  }

  // 文本标注
  let markerText = new qq.maps.Label({
    position: center,
    map,
    offset: mapTextPosition,
    style: cssC,
    content: labelText
  });
}

//调用初始化函数地图
init();

// 刷新数据
function refresh() {}

rider();

// 获取骑手信息、寄、收信息
function rider() {
  request({
    url:
      "http://pay.toozan666.com/logistics/public/api/index/orderXq?origin_id=1539593830942",
    type: "GET",
    data: {}
  })
    .then(res => {
      console.log(res);
      // 配送公司
      let logistics = $(".logistics").html();

      // 骑手手机号码
      let phone = $(".phone").html();

      // 骑手名字
      let name = $(".name").html();

      // 骑手状态
      let title = $(".title").html();
    })
    .catch(err => {
      console.log(err);
    });
}

// 初始化请求
function request(params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      ...params,
      dataType: "JSON",
      success: res => {
        const resData = res;
        resData.code === 1 ? resolve(resData) : reject(resData);
      },
      error: err => {
        console.log(err);
      }
    });
  });
}

// 切换红包领取方式
$(".model-title img")
  .eq(0)
  .on("touchstart", function() {
    $(this).attr("src", "./images/applets.png");
    $(".model-title img")
      .eq(1)
      .attr("src", "./images/default.png");
    $(".model-content").css("transform", "translateX(0)");
  });

// 切换红包领取方式
$(".model-title img")
  .eq(1)
  .on("touchstart", function() {
    $(this).attr("src", "./images/tutorial-img.png");
    $(".model-title img")
      .eq(0)
      .attr("src", "./images/default.png");
    $(".model-content").css("transform", "translateX(-50%)");
  });

// 打开蒙层，打开红包弹窗
$(".envelope").on("touchstart", function() {
  $(".mask").css("display", "block");
  $(".model").css("bottom", "0");
});

function showModel() {
  $(".mask").css("display", "block");
  $(".model").css("bottom", "0");
}

// 关闭蒙层，隐藏红包
$(".mask").on("touchstart", function() {
  $(".mask").css("display", "none");
  $(".model").css("bottom", "-250px");
});

// 关闭红包提示
$(".close").on("touchstart", function() {
  $(".prompt").css("left", "-304px");
  setTimeout(() => {
    $(".envelope").css({ width: "45px", height: "45px" });
  }, 500);
});
