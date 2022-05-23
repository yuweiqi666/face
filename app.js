const video = document.querySelector('#video')

let expressions = {}

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
]).then(startVideo())
  .catch(err => {
    console.log('catch err', err)
  })

video.addEventListener('play', () => {
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


var btn = document.querySelector('button')

btn.addEventListener('click', handlePhoto)

Webcam.set({
  width: 320,
  height: 240,
  image_format: 'jpeg',
  jpeg_quality: 90
});
Webcam.attach('#my_camera');


function handlePhoto () {
  Webcam.snap(function (data_uri) {
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
      div2.innerHTML += `
        <div class='face-data-item'>
          <div class='face-data-item-name' style='font-weight: 700;'>${key} :</div>
          <div style='margin-left: 10px;'>${expressions[key]}</div>
        </div>
      `
    }
    // display results in page
    document.getElementById('results').innerHTML =
      ` 
      <h2>Here is your image:</h2>
      <div class='face-wrapper'> 
        <img class='face-image' src="${data_uri}" width='320' height='240'/>
        <div class='face-data'>
          <div class='face-data1'>
            ${div1.innerHTML}
          </div>
          <div class='face-data2'>
            ${div2.innerHTML}
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


var file = document.querySelector('input');
if (getIos()) {
  file.removeAttribute("capture"); //如果是ios设备就删除"capture"属性
}
function getIos () {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/iPhone\sOS/i) == "iphone os") {
    return true;
  } else {
    return false;
  }
}
