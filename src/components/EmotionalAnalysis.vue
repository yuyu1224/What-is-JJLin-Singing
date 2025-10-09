<template>
  <div>
    <h1 class="title">林俊杰歌词包含情感分析</h1>
    <div class="bar-chart-container">
      <svg id="bar-chart"></svg>
    </div>
    <div class="bubble-chart-container">
      <svg id="bubble-chart"></svg>
    </div>
    <div class="tooltip" id="tooltip"></div>

    <!-- Custom Lyrics Modal -->
    <div id="lyricsModal" class="lyrics-modal">
      <div class="lyrics-modal-content">
        <span @click="closeLyricsModal" class="close-button">&times;</span>
        <h2 id="songTitle" class="song-title">{{ currentSongName }} 的歌词</h2>
        <pre id="songLyrics" class="song-lyrics">{{ currentSongLyrics }}</pre>
      </div>
    </div>

    <!-- Audio player -->
    <audio v-show="isAudioPlayerVisible" ref="audioPlayer" controls>
      Your browser does not support the audio tag.
    </audio>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as d3 from "d3";

export default {
  name: "EmotionalAnalysis",
  setup() {
    const currentSongName = ref("");
    const currentSongLyrics = ref("");
    const isAudioPlayerVisible = ref(false);
    const audioPlayer = ref(null);

    const closeLyricsModal = () => {
      document.getElementById("lyricsModal").style.display = "none";
    };

    const showLyrics = (songName, songLyrics) => {
      currentSongName.value = songName;
      currentSongLyrics.value = songLyrics;
      const lyricsModal = document.getElementById("lyricsModal");
      lyricsModal.style.display = "block";
    };

    // const playMusic = (songName) => {
    //   const audioPlayer = document.getElementById("audio-player");
    //   audioPlayer.src = `/videos/${songName}.mp3`;
    //   audioPlayer.style.display = "block";
    //   audioPlayer.load();
    //   audioPlayer.play();
    // };
    
    // const playMusic = (songName) => {
    //   // 等待 DOM 更新完成后执行
    //   nextTick(() => {
    //     if (audioPlayer.value) {
    //       console.log("Audio player found");  // 检查 audioPlayer 是否找到
    //       audioPlayer.value.src = `/videos/${songName}.mp3`;  // 设置音频源
    //       audioPlayer.value.style.display = "block";          // 显示音频播放器
    //       audioPlayer.value.load();                           // 加载音频
    //       audioPlayer.value.play();                           // 播放音频
    //     } else {
    //       console.error("Audio player not found.");
    //     }
    //   });
    // };
    const playMusic = (songName) => {
      // 确保音频播放器存在
      if (audioPlayer.value) {
        audioPlayer.value.src = `/videos/${songName}.mp3`; // 设置音频源
        audioPlayer.value.style.display = "block"; // 显示音频播放器
        audioPlayer.value.load(); // 加载音频
        audioPlayer.value.play(); // 播放音频
      } else {
        console.error("Audio player not found.");
      }
    };



    // Data visualization and D3 logic
    onMounted(() => {
      d3.json("./processed_emotion_lyrics.json").then((data) => {
        const categories = ["正面", "中立", "负面"];
        const groupedData = {
          正面: data.filter((d) => d.情感类别 === "正面"),
          中立: data.filter((d) => d.情感类别 === "中立"),
          负面: data.filter((d) => d.情感类别 === "负面"),
        };

        const totalSongs = data.length;

        // Draw bar chart
        const barChartWidth = 1400;
        const barChartHeight = 30;
        const barSvg = d3
          .select("#bar-chart")
          .attr("width", barChartWidth)
          .attr("height", barChartHeight + 20);

        const colorScale = d3
          .scaleOrdinal()
          .domain(categories)
          .range(["#A290E9", "#D1D1D1", "#5CAFFF"]);

        let xOffset = 0;

        barSvg
          .selectAll(".bar")
          .data(categories)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => {
            const width = (groupedData[d].length / totalSongs) * barChartWidth;
            const currentX = xOffset;
            xOffset += width;
            return currentX;
          })
          .attr("y", 0)
          .attr("width", (d) => (groupedData[d].length / totalSongs) * barChartWidth)
          .attr("height", barChartHeight)
          .attr("fill", (d) => colorScale(d))
          .on("click", function (event, d) {
            updateBubbleChart(d);
            d3.selectAll(".bar")
              .classed("selected", false)
              .attr("opacity", 0.5);
            d3.select(this).classed("selected", true).attr("opacity", 1);
          });

        let xLabelOffset = 0;
        barSvg
          .selectAll(".label")
          .data(categories)
          .enter()
          .append("text")
          .attr("x", d => {
            const width = (groupedData[d].length / totalSongs) * barChartWidth;
            const currentX = xLabelOffset + width / 2;
            xLabelOffset += width;
            return currentX;
          })
          .attr("y", barChartHeight + 15)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .attr("font-size", "14px")
          .text((d) => `${d} (${groupedData[d].length})`);

        d3.select(barSvg.selectAll(".bar").nodes()[0]).classed("selected", true);

        const bubbleChartWidth = 1400;
        const bubbleChartHeight = 650;
        const bubbleSvg = d3
          .select("#bubble-chart")
          .attr("width", bubbleChartWidth)
          .attr("height", bubbleChartHeight);

        const tooltip = d3.select("#tooltip");

        const highlightedSongs = [
          "曹操",
          "原来",
          "修炼爱情",
          "交换余生",
          "当你",
          "害怕",
          "零度的亲吻",
          "转动",
          "茉莉雨",
          "小酒窝",
        ];

        function updateBubbleChart(selectedCategory) {
          const selectedData = groupedData[selectedCategory];

          bubbleSvg.selectAll("*").remove();

          const bubbles = bubbleSvg
            .selectAll(".bubble")
            .data(selectedData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .attr("transform", function () {
              const xPos = Math.random() * (bubbleChartWidth - 60) + 30;
              const yPos = Math.random() * (bubbleChartHeight - 60) + 30;
              return `translate(${xPos}, ${yPos})`;
            })
            .call(
              d3
                .drag()
                .on("drag", function (event) {
                  const newX = event.x;
                  const newY = event.y;
                  d3.select(this).attr("transform", `translate(${newX}, ${newY})`);
                })
            );

          bubbles
            .append("circle")
            .attr("class", "bubble")
            .attr("r", 30)
            .attr("fill", colorScale(selectedCategory))
            .attr("opacity", 0.5)
            .classed("highlighted", (d) => highlightedSongs.includes(d.歌名))
            .on("mouseover", function (event, d) {
              tooltip.style("display", "block").html(`
                <strong>歌名:</strong> ${d.歌名}<br><strong>情感值:</strong> ${d.情感值}<br><strong>关键词:</strong> ${d.关键词}`);
            })
            .on("mousemove", function (event) {
              tooltip.style("top", event.pageY + 10 + "px").style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", function () {
              tooltip.style("display", "none");
            })
            .on("click", function (event, d) {
              if (d.selected) {
                playMusic(d.歌名);
              } else {
                showLyrics(d.歌名, d.歌词);
              }
            });

          bubbles
            .filter((d) => d.selected)
            .append("circle")
            .attr("class", "highlighted-border")
            .attr("r", 35)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

          bubbles
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text((d) => d.关键词.split(",")[0]);

          const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(selectedData, (d) => d.情感值)])
            .range([15, 30]);

          bubbles
            .select("circle")
            .transition()
            .duration(1000)
            .attr("r", (d) => radiusScale(d.情感值));
        }

        updateBubbleChart("正面");
      });
    });

    return {
      currentSongName,
      currentSongLyrics,
      isAudioPlayerVisible,
      closeLyricsModal,
      showLyrics,
    };
  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
  background-color: #fff6df;
}

.title {
  text-align: center;
  margin-top: 30px;
  font-size: 36px;
  color: #d87b6b;
}

.bar-chart-container {
  margin-top: 50px;
  margin-bottom: 50px;
}

.bubble-chart-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.tooltip {
  position: absolute;
  display: none;
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 14px;
  color: #333;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.lyrics-modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
}

.lyrics-modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  margin: 10% auto;
}

.close-button {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close-button:hover,
.close-button:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.song-title {
  font-size: 22px;
  color: #333;
}

.song-lyrics {
  font-size: 16px;
  color: #555;
  white-space: pre-wrap;
}

#audio-player {
  display: none;
  margin-top: 20px;
}
</style>
