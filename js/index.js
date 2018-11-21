const container = document.getElementById("container");
const KEY = "AD5BZ-HMBWV-B45PP-UY6CR-RMVZ3-XWBXG";

//初始化地图函数  自定义函数名init
function init(params) {
  const {
    receiver_lat,
    receiver_lng,
    status,
    send_lat,
    send_lng,
    transporterLat,
    transporterLng,
    juli
  } = params;
  let center = new qq.maps.LatLng(transporterLat, transporterLng); // 纬度，经度,地图显示中心 骑手的位置
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
    position: new qq.maps.LatLng(receiver_lat, receiver_lng),
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
    position: new qq.maps.LatLng(send_lat, send_lng),
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
  // qq.maps.event.addListener(markerRecipient, "click", function(event) {
  //   const {
  //     latLng: {
  //       lat,
  //       lng
  //     }
  //   } = event;
  //   console.log(lat, lng);
  // });

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
  if (status === 3) {
    labelText = `<div class="mark-text">
                      <p>骑手正赶往您这里</p>
                      <p class="distance">距离您<span>${juli}m</span></p>
                      <span class="triangle_border_down"></span>
                  </div>`;
    mapTextPosition = new qq.maps.Size(-55, -80);
  } else if (status === 2) {
    labelText = `<div class="mark-text">
                      <p>骑手正在前往商家取货</p>
                      <p class="distance">距离您<span>${juli}m</span></p>
                      <span class="triangle_border_down position-triangle"></span>
                  </div>`;
    mapTextPosition = new qq.maps.Size(-78, -80);
  } else if (status === 4) {
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

// 截取当前请求的参数
function GetUrlPara() {
  var url = document.location.toString();
  var arrUrl = url.split("?");
  var para = arrUrl[1];
  return para;
}

// 刷新数据
function refresh() {
  rider();
}

rider();

// 获取骑手信息、寄、收信息
function rider() {
  request({
    url: `https://order.toozan.cc/logistics/public/api/index/orderXq?${GetUrlPara()}`,
    type: "GET",
    data: {}
  })
    .then(res => {
      // console.log(res);
      let resData = res.result;
      if (
        resData.order_status == 2 ||
        resData.order_status == 3 ||
        resData.order_status == 4
      ) {
        $("#map").css("display", "block");
        let params = {
          receiver_lat: parseFloat(resData.receiver_lat), //收件人纬度
          receiver_lng: parseFloat(resData.receiver_lng), //收件人经度
          send_lat: parseFloat(resData.send_lat), //商家纬度
          send_lng: parseFloat(resData.send_lng), //商家经度
          transporterLat: parseFloat(resData.transporterLat), //骑手纬度
          transporterLng: parseFloat(resData.transporterLng), //骑手经度
          juli: resData.juli*1000, //距离
          status: parseInt(resData.order_status) //订单状态 待取货＝2 配送中＝3 已完成＝4 已取消＝5
        };
        //调用初始化函数地图
        init(params);
        // 配送公司
        $(".logistics").text(resData.name + "配送");
        // 骑手手机号码
        $(".phone").text(resData.psy_mobile);
        // 骑手名字
        $(".name").text(resData.psy_name);
        $("#callPhone").attr("href", "tel:" + resData.psy_mobile);
        // 骑手状态
        if (resData.order_status == 2) {
          $(".title").text("骑手已接单，正在前往商家取货");
        } else if (resData.order_status == 3) {
          $(".title").text("骑手已取货，正在前往您这里");
        } else {
          $(".title").text("订单已完成");
        }
      } else if (resData.order_status == 5) {
        $("#cancel").css("display", "block");

        let info = "";
        for (let i = 0; i < resData.goods.length; i++) {
          info +=
            resData.goods[i].productName +
            "/价格:" +
            resData.goods[i].productTotalPrice +
            "元  ";
        }

        $("#goods_info").text(info);

        $("#orderInfo").text("#" + resData.bigNumb);

        $("#orderInfo").prepend(`<img src="${resData.icon}" />`);

        $("#order_id").text(resData.ordernumber);
        $("#order_time").text(
          formatDate(resData.UserCancelTime, "Y-M-D h:m:s")
        );
      } else if (resData.order_status == 7) {
        $("#invalid").css("display", "block");
      }
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
        alert(String(err.msg));
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

var clipboard = new ClipboardJS("#btn");

clipboard.on("success", function(e) {
  // console.info("Action:", e.action);
  console.info("Text:", e.text);
  // console.info('Trigger:', e.trigger);
  e.clearSelection();
  setTimeout(function() {
    alert("叮叮配送文字已复制到您的粘贴板");
  }, 500);
});

clipboard.on("error", function(e) {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
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
    $(".envelope").css({
      width: "45px",
      height: "45px"
    });
  }, 500);
});

//
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};
/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
 */
function formatDate(number, format) {
  var formateArr = ["Y", "M", "D", "h", "m", "s", "年", "月", "日"];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
