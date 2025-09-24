var isVoice = 0;
const googleTranslateLanguages = Object.fromEntries(Object.entries({'af':'Afrikaans','sq':'Albanian','am':'Amharic','ar':'Arabic','hy':'Armenian','as':'Assamese','az':'Azerbaijani','eu':'Basque','be':'Belarusian','bn':'Bengali','bs':'Bosnian','bg':'Bulgarian','my':'Burmese','ca':'Catalan','ceb':'Cebuano','zh-CN':'Chinese (Simplified)','zh-TW':'Chinese (Traditional)','hr':'Croatian','cs':'Czech','da':'Danish','nl':'Dutch','en':'English','eo':'Esperanto','et':'Estonian','fil':'Filipino','fi':'Finnish','fr':'French','gl':'Galician','ka':'Georgian','de':'German','el':'Greek','gu':'Gujarati','ht':'Haitian Creole','ha':'Hausa','haw':'Hawaiian','he':'Hebrew','hi':'Hindi','hu':'Hungarian','is':'Icelandic','ig':'Igbo','id':'Indonesian','ga':'Irish','it':'Italian','ja':'Japanese','jw':'Javanese','kn':'Kannada','kk':'Kazakh','km':'Khmer','rw':'Kinyarwanda','ko':'Korean','ku':'Kurdish (Kurmanji)','ckb':'Kurdish (Sorani)','ky':'Kyrgyz','lo':'Lao','lv':'Latvian','lt':'Lithuanian','lb':'Luxembourgish','mk':'Macedonian','mg':'Malagasy','ms':'Malay','ml':'Malayalam','mt':'Maltese','mi':'Maori','mr':'Marathi','mn':'Mongolian','ne':'Nepali','no':'Norwegian','or':'Odia','ps':'Pashto','fa':'Persian','pl':'Polish','pt':'Portuguese','pa':'Punjabi','ro':'Romanian','ru':'Russian','sr':'Serbian','st':'Sesotho','si':'Sinhala','sk':'Slovak','sl':'Slovenian','so':'Somali','es':'Spanish','su':'Sundanese','sw':'Swahili','sv':'Swedish','ta':'Tamil','te':'Telugu','th':'Thai','tr':'Turkish','uk':'Ukrainian','ur':'Urdu','uz':'Uzbek','vi':'Vietnamese','cy':'Welsh','xh':'Xhosa','yi':'Yiddish','yo':'Yoruba','zu':'Zulu'}).map(([k,v]) => [v,k]));

stopSpeech()
function stopSpeech() {
    $('#voiceIndicator').removeClass('active');
    $('#voice_search').removeClass('voice-active');

    const speechEngine = window.speechSynthesis;
    if (speechEngine.speaking) {
        speechEngine.cancel();
    }

    $('audio').each(function() {
        if (!this.paused) {
            this.pause();
            this.currentTime = 0; // optional: reset to start
        }
    });
}




function speakAIResponse(text, detectedLang) {
    let synth = window.speechSynthesis;
    let voices = synth.getVoices();
    isVoice = 0;
    
    if (!voices.length) {
        synth.onvoiceschanged = () => speakAIResponse(text, detectedLang);
        return;
    }

    let cleanText = text.replace(/<[^>]*>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();

    const selectedOption = $('#lang option:selected');
    const preferredLang = detectedLang || selectedOption.data('lang') || 'en-US';
    const preferredVoiceName = selectedOption.data('voice');

    let voiceToUse = voices.find(v => v.name === preferredVoiceName) ||
        voices.find(v => (v.lang || '') === preferredLang) ||
        voices.find(v => (v.lang || '').startsWith(preferredLang.split('-')[0])) ||
        voices.find(v => (v.lang || '').startsWith('en'));

    let utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = preferredLang || 'en-US';
    if (voiceToUse) utterance.voice = voiceToUse;
    
    utterance.rate = 0.75;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    // Show voice indicator
    
    // Add event listeners for better user experience
    utterance.onstart = () => {
        $('#voiceIndicator').addClass('active');
        $('#voice_search').addClass('voice-active');
    };
    
    utterance.onend = () => {
        // Hide voice indicator
        $('#voiceIndicator').removeClass('active');
        $('#voice_search').removeClass('voice-active');
        // Reset voice conversation flag after response is complete
    };

    utterance.onerror = (event) => {
        // console.error('Speech synthesis error:', event.error);
        // Hide voice indicator on error
        $('#voiceIndicator').removeClass('active');
        $('#voice_search').removeClass('voice-active');
    };

    // Stop any current speech and speak the new response
    stopSpeech();
    synth.speak(utterance);
}

function scrollToBottom() {
    setTimeout(() => {
        const $chatArea = $(".container");
        if ($chatArea.length === 0) return;
        $chatArea.stop().animate(
            { scrollTop: $chatArea[0].scrollHeight },
            500   
        );
    }, 50);
}


const $chatContainer = $(".container");
const $scrollBtn = $("#scrollToBottomBtn");

// Show button only when scrolled up from bottom
$chatContainer.on("scroll", function() {
    const scrollTop = $chatContainer.scrollTop();
    const scrollHeight = $chatContainer[0].scrollHeight;
    const clientHeight = $chatContainer[0].clientHeight;

    if (scrollHeight - scrollTop > clientHeight + 50) { // user scrolled up
        $scrollBtn.fadeIn();
    } else {
        $scrollBtn.fadeOut();
    }
});

// Scroll to bottom when button clicked
$scrollBtn.on("click", function() {
    $chatContainer.stop().animate(
        { scrollTop: $chatContainer[0].scrollHeight },
        400 // smooth scroll duration
    );
});



$(document).ready(function() {

    $(document).click(function() {
        $('#microphone').removeClass('visible');
    })

    $('#voice_search').click(function(event) {
        stopSpeech();
        $('#microphone').addClass('visible');
            $(".chat-message .volume-icon.material-icons.active").text("volume_up").removeClass("active").addClass("deactive");

        event.stopPropagation();

    })
    $('#voiceIndicator').click(function(event) {
        stopSpeech();
            $(".chat-message .volume-icon.material-icons.active").text("volume_up").removeClass("active").addClass("deactive");

    })




    $(".recoder").click(function(event) {
        event.stopPropagation();

    })
    $('#microphone .close').click(function() {
        $('#microphone').removeClass('visible');
    })

});









$(document).ready(function() {
    var synth = window.speechSynthesis;
    var $langSelect = $('#lang');

    function populateLanguages() {
        var voices = synth.getVoices();
        $langSelect.empty();

        var addedLangs = new Set();
        var defaultSet = false;

        $.each(voices, function(index, voice) {
            if (!addedLangs.has(voice.lang)) {
                var $option = $('<option>', {
                    value: voice.lang,
                    text: voice.name + ' - ' + voice.lang
                });

                if (voice.name.includes()) {
                    $option.prop('selected', true);
                    defaultSet = true;
                }

                $langSelect.append($option);
                addedLangs.add(voice.lang);
            }
        });

        if (!defaultSet && $langSelect.children().length > 0) {
            $langSelect.children().first().prop('selected', true);
        }
    }

    populateLanguages();

    if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = populateLanguages;
    }
});

$(document).ready(function() {
    var speech;
    let r = 0;
    let voices = [];
    let synth;
    let micActive = false;
    let mediaStream = null;

    window.addEventListener("load", () => {
        synth = window.speechSynthesis;
        voices = synth.getVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = voices;
        }
    });

    function checkhSpeach() {
        $('#speakBtn').removeClass('active');
        if (r == 0) {
            // new Audio('assets/audio/end.mp3').play();
            setTimeout(function() {
                speech.recognition.stop();
                speechText();
                $('#sendBtn').click();
            }, 1500);
        }
        r++;
        setTimeout(function() {
            r = 0;
        }, 3000);

        let text = $('#recoredText').text().trim();
        if (text.length > 1) {
            $('#prompt').val(text);
            $('#recoredText').val('');
            $("#prompt").trigger("keyup");
            $('#microphone').removeClass('visible');
        }
    }

    $('#speakBtn').click(function() {
        if ($('#speakBtn').hasClass('active')) {
            // Stop listening when user clicks again
            $('#speakBtn').removeClass('active recognizing');
            if (speech && speech.recognition) {
                speech.recognition.stop();
            }
        } else {
            // Start listening
            $('#speakBtn').addClass('active');
            $('#speakBtn').removeClass('recognizing'); // Reset recognizing state
            new Audio('assets/audio/start.mp3').play();
            setTimeout(function() {
                let language = $('#microphone select').val().trim();
                speak(language);
                if (speech && speech.recognition) {
                    speech.recognition.start();
                }
            }, 500);

            $('#mic-status').removeClass('active').text('Microphone is off');
        }
    });

    function speak(language) {
        window.SpeechRecognition = window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            window.mozSpeechRecognition;


        speech = {
            enabled: true,
            listening: false,
            recognition: new SpeechRecognition(),
            text: ""
        };
        speech.recognition.continuous = true;
        speech.recognition.interimResults = true;
        speech.recognition.lang = language;

        speech.recognition.addEventListener("start", () => {
            $('#speakBtn').addClass('recognizing');
        });

        speech.recognition.addEventListener("end", () => {
            $('#speakBtn').removeClass('recognizing');
        });

        speech.recognition.addEventListener("error", () => {
            $('#speakBtn').removeClass('recognizing');
        });

        speech.recognition.addEventListener("result", (event) => {
            const audio = event.results[event.results.length - 1];
            speech.text = audio[0].transcript;
            const tag = document.activeElement.nodeName;
            if (tag === "INPUT" || tag === "TEXTAREA") {
                if (audio.isFinal) {
                    document.activeElement.value += speech.text;
                }
            }
            $('#recoredText').text(speech.text);

            // Add extra visual feedback when recognizing text
            if (!audio.isFinal) {
                $('#speakBtn').addClass('recognizing');
            } else {
                $('#speakBtn').removeClass('recognizing');
            }

            if (audio.isFinal) {
                checkhSpeach();
            }
        });
    }



    function speechText() {
        let say = $('#recoredText').text().trim();
        if (!say) return;

        isVoice = 1;

        let synth = window.speechSynthesis;

        let voices = synth.getVoices();
        if (!voices.length) {
            synth.onvoiceschanged = () => speechText(); // Retry after voices load
            return;
        }

        let selectedLang = $('#lang').val() || 'en-US';

        let voiceToUse = voices.find(v => v.lang.startsWith(selectedLang)) ||
            voices.find(v => v.lang.startsWith('en-US'));

        if (selectedLang.startsWith('en')) say = 'Showing prompt: ' + say;
        else if (selectedLang.startsWith('bn')) say = 'প্রম্পট দেখানো হচ্ছে: ' + say;
        else if (selectedLang.startsWith('hi')) say = 'प्रॉम्प्ट दिखा रहा है: ' + say;
        else if (selectedLang.startsWith('ur')) say = 'پرومپٹ دکھا رہا ہے: ' + say;
        else if (selectedLang.startsWith('fr')) say = 'affichage de l’invite : ' + say;
        else if (selectedLang.startsWith('pt')) say = 'mostrando o prompt: ' + say;

        // Speak
        let utterance = new SpeechSynthesisUtterance(say);
        if (voiceToUse) utterance.voice = voiceToUse;
        synth.speak(utterance);
    }




});




$(document).ready(function() {
        let flag = 1;
        // Utility Functions
        function getPromptText() {
          return $('#prompt').val().trim();
        }

        function clearPrompt() {
          $('#prompt').val('');
        }

        function setButtonsDisabled(disabled = true) {
          $('#sendBtn').prop('disabled', disabled);
          $('#voice_search').prop('disabled', disabled);
        }

        function appendUserMessage(text) {
          $(".chat-area").append(`
            
									
									<div class="input-box">
										<div class="message">
											<p>${text}</p>
										</div>
										<div class="icon-wrapper">
											<svg
												xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
												<path d="M12 11.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
												<path fill-rule="evenodd" d="M2.513 14.077c.427 1.344 1.144 2.524 2.158 3.493.593.565 1.25.998 1.942 1.353A9.998 9.998 0 0 0 12 22.5c2.686 0 5.224-.809 7.387-2.378a7.522 7.522 0 0 1-.954-1.076l-.41-.41a5.158 5.158 0 0 0-1.077-.92c-.657-.362-1.378-.588-2.127-.674a18.284 18.284 0 0 0-1.923-.205 18.423 18.423 0 0 0-3.328.096c-.76.088-1.503.313-2.164.675a5.21 5.21 0 0 0-1.085.92l-.41.41c-.244.246-.465.48-.654.708a10.045 10.045 0 0 0-.847.962 10.012 10.012 0 0 0-.962.847l-.025.027a3.024 3.024 0 0 1-.724.593c-.633.364-1.348.59-2.091.674-.63.074-1.295.06-1.92-.046-.226-.038-.45-.074-.674-.11ZM3.75 7.5c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v6.75a9.996 9.996 0 0 0-2.07-.363 18.204 18.204 0 0 1-3.328-.096 18.416 18.416 0 0 1-1.923-.205c-.749-.086-1.47-.312-2.127-.674a5.158 5.158 0 0 0-1.077-.92l-.41-.41a7.522 7.522 0 0 1-.954-1.076C5.224 15.06 4.417 12.52 4.417 10.5a7.5 7.5 0 0 1-1.125-3V7.5Zm0 0c-.621 0-1.125.504-1.125 1.125v.75c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5V8.625c0-.621-.504-1.125-1.125-1.125H3.75Z" clip-rule="evenodd" />
											</svg>
										</div>
									</div>
        `);
        }

        function appendBotMessage(reply, detectedLang = "EN", translatedQuery = "", cleantext = "", lang = "", isVoice) {
          removeDelayAnimation();
          $(".chat-area").append(`
            
									
									<div class="chat-message">
										<div class="icon-wrapper">
											<svg
												xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
												<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.061-1.061l-1.59 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM12 1.5a.75.75 0 0 0-.75.75V3a.75.75 0 0 0 1.5 0V2.25a.75.75 0 0 0-.75-.75ZM6.166 18.894a.75.75 0 0 0 1.061 1.06l1.59-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59ZM18.894 17.832a.75.75 0 0 1 0 1.062l-1.59 1.59a.75.75 0 0 1-1.061-1.06l1.59-1.59a.75.75 0 0 1 1.062 0ZM12 22.5a.75.75 0 0 0 .75-.75v-2.25a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75ZM22.5 12a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25c.414 0 .75-.336.75-.75ZM1.5 12a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 0-1.5H2.25c-.414 0-.75.336-.75.75ZM17.832 6.166a.75.75 0 0 1 1.062 0l1.59 1.59a.75.75 0 1 1-1.06 1.061l-1.59-1.59a.75.75 0 0 1 0-1.061ZM6.166 5.105a.75.75 0 0 1 1.06-1.06l1.59 1.59a.75.75 0 0 1-1.06 1.061l-1.591-1.59Z" />
											</svg>
										</div>
										<div class="message-content">
											<div class="chat-header">
												<span class="label detected">
													<svg
														xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
														<path fill-rule="evenodd" d="M2.513 14.077c.427 1.344 1.144 2.524 2.158 3.493.593.565 1.25.998 1.942 1.353A9.998 9.998 0 0 0 12 22.5c2.686 0 5.224-.809 7.387-2.378a7.522 7.522 0 0 1-.954-1.076l-.41-.41a5.158 5.158 0 0 0-1.077-.92c-.657-.362-1.378-.588-2.127-.674a18.284 18.284 0 0 0-1.923-.205 18.423 18.423 0 0 0-3.328.096c-.76.088-1.503.313-2.164.675a5.21 5.21 0 0 0-1.085.92l-.41.41c-.244.246-.465.48-.654.708a10.045 10.045 0 0 0-.847.962 10.012 10.012 0 0 0-.962.847l-.025.027a3.024 3.024 0 0 1-.724.593c-.633.364-1.348.59-2.091.674-.63.074-1.295.06-1.92-.046-.226-.038-.45-.074-.674-.11ZM3.75 7.5c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v6.75a9.996 9.996 0 0 0-2.07-.363 18.204 18.204 0 0 1-3.328-.096 18.416 18.416 0 0 1-1.923-.205c-.749-.086-1.47-.312-2.127-.674a5.158 5.158 0 0 0-1.077-.92l-.41-.41a7.522 7.522 0 0 1-.954-1.076C5.224 15.06 4.417 12.52 4.417 10.5a7.5 7.5 0 0 1-1.125-3V7.5Zm0 0c-.621 0-1.125.504-1.125 1.125v.75c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5V8.625c0-.621-.504-1.125-1.125-1.125H3.75Z" clip-rule="evenodd" />
													</svg>
                          Detected Language: ${detectedLang}
                          
                          
												</span>
												<span class="label translated">
													<svg
														xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
														<path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0Zm18.528 2.222a.75.75 0 0 0-1.06 1.06l1.22 1.22a.75.75 0 0 0 1.06-1.06l-1.22-1.22Z" clip-rule="evenodd" />
														<path d="M11.25 17.25a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 1.5 0V18a.75.75 0 0 0-.75-.75Z" />
													</svg>
                            Translated Query: ${translatedQuery}
                            
												</span>
											</div>
											<div class="chat-bubble">
												<div class="volume-container">
													<i class="volume-icon material-icons deactive" title="Speak">volume_up</i>
													<span class="loading-spinner" style="display:none;">
														<span class="loading-spinner material-icons tts-spin" style="display:none;">autorenew</span>
													</div>
												${reply}
											
												</div>
											</div>
											<input type="hidden" class="cleantext" value="${cleantext}">
												<input type="hidden" class="lang" value="${lang}">
													<input type="hidden" class="isVoice" value="${isVoice?1:0}">
													</div>

        `);
          scrollToBottom();
          if (isVoice) {
            stopSpeech();
            speakAIResponse(cleantext, detectedLang);
            $(".chat-message:last .volume-icon").text("volume_down").removeClass("deactive").addClass("active");
          }
          volumeControls();
        }
        async function volumeControls() {
          $(".chat-message:last .volume-icon").off("click").on("click", async function() {
            const $icon = $(this);
            if ($icon.hasClass("active")) {
              stopSpeech();
              $icon.text("volume_up").removeClass("active").addClass("deactive");
            } else {
              stopSpeech();
              const $chatMessage = $icon.closest(".chat-message");
              $icon.text("volume_down").removeClass("deactive").addClass("active");
              const cleantext = $chatMessage.find(".cleantext").val();
              const lang = $chatMessage.find(".lang").val();
              const isVoice = $chatMessage.find(".isVoice").val() === "1";
              if (isVoice || (lang && lang.trim() !== "")) {
                // console.log(isVoice, lang);
                speakAIResponse(cleantext, lang);
              } else {
                const audioElement = $chatMessage.find('audio');
                if (audioElement.length > 0) {
                  audioElement[0].playbackRate = 0.8; // set speed
                  audioElement[0].play();
                  $('#voiceIndicator').addClass('active');
                  $('#voice_search').addClass('voice-active');
                } else {
                  let ll = googleTranslateLanguages[$(".label.detected").text().split(":")[1].trim()];
                  const $spinner = $chatMessage.find(".loading-spinner");
                  $icon.hide();
                  $spinner.show();
                  try {
                    const audio = await tts(cleantext, ll); // await the promise
                    if (audio) {
                      audio.play();
                      $chatMessage.append(audio);
                      $('#voiceIndicator').addClass('active');
                      $('#voice_search').addClass('voice-active');
                      $icon.show();
                      $spinner.hide();
                    }
                  } catch (error) {
                    console.error("Error playing TTS:", error);
                  }
                }
              }
            }
          });
        }

        function addDelayAnimation() {
          $('.chat-area').append(`
         
									
													<div class="chat-message fourdot">
														<div class="icon-wrapper">
															<svg
																xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
																<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.061-1.061l-1.59 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM12 1.5a.75.75 0 0 0-.75.75V3a.75.75 0 0 0 1.5 0V2.25a.75.75 0 0 0-.75-.75ZM6.166 18.894a.75.75 0 0 0 1.061 1.06l1.59-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59ZM18.894 17.832a.75.75 0 0 1 0 1.062l-1.59 1.59a.75.75 0 0 1-1.061-1.06l1.59-1.59a.75.75 0 0 1 1.062 0ZM12 22.5a.75.75 0 0 0 .75-.75v-2.25a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75ZM22.5 12a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25c.414 0 .75-.336.75-.75ZM1.5 12a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 0-1.5H2.25c-.414 0-.75.336-.75.75ZM17.832 6.166a.75.75 0 0 1 1.062 0l1.59 1.59a.75.75 0 1 1-1.06 1.061l-1.59-1.59a.75.75 0 0 1 0-1.061ZM6.166 5.105a.75.75 0 0 1 1.06-1.06l1.59 1.59a.75.75 0 0 1-1.06 1.061l-1.591-1.59Z" />
															</svg>
														</div>
														<div class="message-content">
															<div class="dot"></div>
															<div class="dot"></div>
															<div class="dot"></div>
														</div>
													</div>
        `);
          new Audio('assets/audio/message send.mp3').play();
        }

        function removeDelayAnimation() {
          $('.chat-area .fourdot').remove();
          new Audio('assets/audio/message-notification.mp3').play();
        }

        function appendErrorMessage(message = "Error: Could not connect to server.") {
          removeDelayAnimation();
          $(".chat-area").append(`
            
									
													<div class="chat-message">
														<div class="icon-wrapper">
															<svg
																xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
																<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.061-1.061l-1.59 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM12 1.5a.75.75 0 0 0-.75.75V3a.75.75 0 0 0 1.5 0V2.25a.75.75 0 0 0-.75-.75ZM6.166 18.894a.75.75 0 0 0 1.061 1.06l1.59-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59ZM18.894 17.832a.75.75 0 0 1 0 1.062l-1.59 1.59a.75.75 0 0 1-1.061-1.06l1.59-1.59a.75.75 0 0 1 1.062 0ZM12 22.5a.75.75 0 0 0 .75-.75v-2.25a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75ZM22.5 12a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25c.414 0 .75-.336.75-.75ZM1.5 12a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 0-1.5H2.25c-.414 0-.75.336-.75.75ZM17.832 6.166a.75.75 0 0 1 1.062 0l1.59 1.59a.75.75 0 1 1-1.06 1.061l-1.59-1.59a.75.75 0 0 1 0-1.061ZM6.166 5.105a.75.75 0 0 1 1.06-1.06l1.59 1.59a.75.75 0 0 1-1.06 1.061l-1.591-1.59Z" />
															</svg>
														</div>
														<div class="message-content">
															<div class="chat-bubble">
																<p style="text-align: justify;">${message}</p>
															</div>
														</div>
													</div>
        `);
        }
        // Press Enter to send message
        $('#prompt').on('keydown', function(e) {
          if (flag === 1 && (e.key === 'Enter' || e.keyCode === 13)) {
            e.preventDefault();
            const promptText = getPromptText();
            if (promptText.length > 1) {
              $('#sendBtn').click();
            }
          }
        });
        $('#sendBtn').click(async function() {
          stopSpeech();
          $(".chat-message .volume-icon.material-icons.active").text("volume_up").removeClass("active").addClass("deactive");
          const promptText = getPromptText();
          if (promptText.length <= 1) return;
          clearPrompt();
          setButtonsDisabled(true);
          flag = 0;
          appendUserMessage(promptText);
          addDelayAnimation();
          try {
            const response = await fetch("http://127.0.0.1:8000/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: promptText
              })
            });
            const data = await response.json();
            const ll = googleTranslateLanguages[data.detectedLang.trim()];
            let synth = window.speechSynthesis;
            let voices = synth.getVoices();
            let voiceToUse = voices.find(v => (v.lang || '').startsWith(ll));
            var lang = ""
            if (voiceToUse) {
              lang = voiceToUse['lang']
            };
            appendBotMessage(data.reply, data.detectedLang, data.translatedQuery, data.raw, lang);
          } catch (err) {
            console.error("Error:", err);
            appendErrorMessage();
            setButtonsDisabled(false);
            flag = 1;
          } finally {
            setButtonsDisabled(false);
            flag = 1;
          }
        });
        async function tts(text, lang) {
          try {
            const audioResponse = await fetch("http://127.0.0.1:8000/chat_audio", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: text,
                lang: lang
              })
            });
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            // console.log("Size in KB:", (audioBlob.size / 1024).toFixed(2));
            const audio = new Audio(audioUrl);
            return audio;
          } catch (error) {
            console.error("TTS error:", error);
          }
        }
      });