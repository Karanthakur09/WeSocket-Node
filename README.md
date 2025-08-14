Added one file name **CHUNK.js**

please do check but in this if in vedio stream pipestream errors comes, but how do we handle it if I was pushing it into logs it makes the terminal kind of mess

one way used by me is -
  if (e && e.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        console.error('Stream error:', e);
    }

any other effective way, do check **netflix style** vedio stream kind feature
