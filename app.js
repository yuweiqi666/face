const video = document.querySelector('#video')

let expressions = {}

let isMobile = false

let mediaHeight

const fileInput = document.querySelector('input.select-file')

fileInput.addEventListener('change', function () {
  var files = this.files[0];
  var url = URL.createObjectURL(files);
  video.src = url;
  // video.load()
  // video.play()
  // video.controls = 'controls'
})


function browserRedirect () {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
  if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    console.log('跳转移动端页面')
    isMobile = true
  } else {
    console.log('跳转pc端页面')
    isMobile = false
  }
}
browserRedirect();

video.addEventListener('canplay', function () {
  if (!isMobile) {
    this.width = 720;
    this.height = 560;
  } else {
    this.width = 375
    this.height = (this.videoHeight / this.videoWidth) * 375
    mediaHeight = (this.videoHeight / this.videoWidth) * 375
  }
});





const startVideo = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  )
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
]).then((function () {
  if (!isMobile) {
    return startVideo()
  } else {
    // video.src = './example/01.mp4'
  }
})())
  .catch(err => {
    console.log('catch err', err)
  })

video.addEventListener('play', () => {
  // const content = document.querySelector('.video-content')

  // if (content.querySelector('canvas')) {
  //   content.removeChild(content.querySelector('canvas'))
  // }


  const canvas = faceapi.createCanvasFromMedia(video)
  const videoContent = document.querySelector('.video-content')
  videoContent.append(canvas)

  const displaySize = {
    width: video.width,
    height: video.height,
  }

  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    expressions = detections[0]?.expressions

    // console.log('expressions', expressions)

    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})


var btn = document.querySelector('button.one')

var btn2 = document.querySelector('button.two')



btn2.addEventListener('click', function () {
  fileInput.click()
})



btn.addEventListener('click', handlePhoto)

Webcam.set({
  width: 320,
  height: 240,
  image_format: 'jpeg',
  jpeg_quality: 90
});
Webcam.attach('#my_camera');

let self = this

function handlePhoto () {
  Webcam.snap(function (data_uri) {
    if (isMobile) {
      const canvas = document.createElement("canvas");
      const canvasCtx = canvas.getContext("2d")
      const ratio = window.devicePixelRatio || 1;
      canvasCtx.scale(ratio, ratio);
      canvas.width = 375;
      canvas.height = mediaHeight;
      console.log('width', canvas.width)
      console.log('height', canvas.height)
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imgBase64 = canvas.toDataURL("image/png");

      data_uri = imgBase64
    }

    const div1 = document.createElement('div')
    const div2 = document.createElement('div')
    for (let key in expressions) {
      if (!expressions.hasOwnProperty(key)) continue
      div1.innerHTML += `
        <div class='face-data-item'>
          <div class='face-data-item-name' style='font-weight: 700;'>${key} :</div>
          <div style='margin-left: 10px;'>${(Number(expressions[key]) * 100).toFixed(1) + '%'}</div>
        </div>
      `
    }
    for (let key in expressions) {
      if (!expressions.hasOwnProperty(key)) continue
      // div2.innerHTML += `
      //   <div class='face-data-item'>
      //     <div class='face-data-item-name' style='font-weight: 700;'>${key} :</div>
      //     <div style='margin-left: 10px;'>${expressions[key]}</div>
      //   </div>
      // `
    }
    // display results in page
    document.getElementById('results').innerHTML =
      ` 
      <h2>Here is your image:</h2>
      <div class='face-wrapper'> 
        <img class='face-image' src="${data_uri}" width='375' height='${mediaHeight}'/>
        <div class='face-data' style='display: flex; justify-content: center; flex-wrap: wrap'>
          <div class='face-data1' style='float: left; margin-bottom: 10px;'>
            ${div1.innerHTML}
          </div>
        </div>
      </div>
    `

    const faceNameDomList = document.getElementById('results').querySelectorAll('.face-data-item-name')
    console.log('faceNameDom', faceNameDomList)

    faceNameDomList.forEach(function (faceDom) {
      let faceStr = faceDom.innerHTML.replace(' :', '')

      faceDom.className = `face-data-item-name ${faceStr}-color`

      faceDom.nextElementSibling.className = `${faceStr}-color`

    })

  });
}

