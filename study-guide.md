# Study Guide

<div id="study-guide"></div>

<script>
  const lessonPages = ['lessons/1.html',
                       'lessons/2.html',
                       'lessons/3.html',
                       'lessons/4.html',
                       'lessons/5.html',
                       'lessons/6.html',
                       'lessons/7.html',
                       'lessons/8.html',
                       'lessons/9.html',
                       'lessons/10.html',
                       'lessons/11.html',
                       'lessons/12.html',
                       'lessons/13.html',
                       ];

  async function generateStudyGuide() {
    const studyGuideContainer = document.getElementById('study-guide');

    for (const lessonPath of lessonPages) {
      try {
        const response = await fetch(lessonPath);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const studyGuideSection = doc.querySelector('h2#study-guide + ul');
        if (studyGuideSection) {
          const lessonNumber = lessonPages.indexOf(lessonPath) + 1;
          const lessonHeader = `<h3><a href="${lessonPath}">Lesson ${lessonNumber}</a></h3>`;
          studyGuideContainer.innerHTML += lessonHeader;
          studyGuideContainer.appendChild(studyGuideSection.cloneNode(true));        }
        } catch (error) {
          console.error("Error fetching or parsing lesson:", lessonPath, error);
        }
    }
  }

  generateStudyGuide();
</script>