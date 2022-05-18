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

    console.log('expressions', expressions)

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
    const div = document.createElement('div')
    // console.log('expressions', expressions)
    for (let key in expressions) {
      if (!expressions.hasOwnProperty(key)) continue
      div.innerHTML += `
        <div class='face-data-item'>
          <div style='font-weight: 700;'>${key} :</div>
          <div style='margin-left: 10px;'>${expressions[key]}<div>
        </div>
      `
    }
    // display results in page
    document.getElementById('results').innerHTML =
      ` 
      <h2>Here is your image:</h2>
      <div class='face-wrapper'> 
        <img class='face-image' src="${data_uri}" width='320' height='240'/>
        <div class='face-data'>${div.innerHTML}</div>
      </div>
    `
  });
}
