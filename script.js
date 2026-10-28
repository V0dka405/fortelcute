(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. Load Configuration (with optional URL query overrides)
  // ---------------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const rawConfig = window.TELL_CONFIG || {};

  const config = {
    recipientName: params.get("to") || rawConfig.recipientName || "เทล",
    senderName: params.get("from") || rawConfig.senderName || "คนที่รู้จักเทลมา 6 ปี",
    lookalikeImage: rawConfig.lookalikeImage || "tell-ig.png",
    notifyEmail: params.get("email") || rawConfig.notifyEmail || "pool254753@gmail.com",
    foodPlace:
      params.get("food") ||
      rawConfig.foodPlace ||
      "ร้านอร่อย ๆ ที่เทลเล็งไว้ หรือเดี๋ยวเราคัดร้านเด็ด ๆ ส่งให้จิ้ม",
    flowerPlace:
      params.get("flower") ||
      rawConfig.flowerPlace ||
      "สวนดอกไม้ / นิทรรศการ / มุมแสงสวย ๆ สักที่ (มีตากล้องส่วนตัวให้ฟรี)",
    cafeIdea:
      params.get("cafe") ||
      rawConfig.cafeIdea ||
      "นั่งเล่นเรื่อย ๆ กินขนมคุยเล่น จะงีบก็ได้ เดี๋ยวเฝ้าของให้",
  };

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("heroRecipient", config.recipientName);
  setText("ticketRecipient", config.recipientName);
  setText("senderNameDisplay", config.senderName);
  setText("planFoodIdea", config.foodPlace);
  setText("planFlowerIdea", config.flowerPlace);
  setText("planCafeIdea", config.cafeIdea);

  // ---------------------------------------------------------------------------
  // 2. Toast Helper
  // ---------------------------------------------------------------------------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-shown");
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // 3. iPhone 6-Screen Story Deck + Swipe Gesture Controller
  // ---------------------------------------------------------------------------
  const pageStage = document.getElementById("pageStage");
  const pages = Array.from(document.querySelectorAll(".page-slide"));
  const storySegs = Array.from(document.querySelectorAll(".story-seg"));
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const prevPageLabel = document.getElementById("prevPageLabel");
  const nextPageLabel = document.getElementById("nextPageLabel");
  const pagerIndicator = document.getElementById("pagerIndicator");

  const nextLabels = [
    "ดูข้อเท็จจริง",
    "เรื่องของเทล",
    "เลือกแผน",
    "ลงวันนัด",
    "ดูตั๋วนัด",
    "",
  ];

  let currentPage = 0;

  function updatePagerUI() {
    if (pagerIndicator) {
      pagerIndicator.textContent = `${currentPage + 1} / ${pages.length}`;
    }

    storySegs.forEach((seg, idx) => {
      seg.classList.toggle("is-done", idx < currentPage);
      seg.classList.toggle("is-active", idx === currentPage);
    });

    if (prevPageBtn) {
      prevPageBtn.classList.toggle("is-hidden", currentPage === 0);
    }
    if (prevPageLabel) {
      prevPageLabel.textContent = currentPage === pages.length - 1 ? "แก้ข้อมูล" : "ย้อนกลับ";
    }

    if (nextPageBtn) {
      nextPageBtn.classList.toggle("is-hidden", currentPage === pages.length - 1);
    }
    if (nextPageLabel && nextLabels[currentPage]) {
      nextPageLabel.textContent = nextLabels[currentPage];
    }
  }

  const printerMachine = document.getElementById("printerMachine");
  const printerChute = document.getElementById("printerChute");
  const printerStatusText = document.getElementById("printerStatusText");
  const reprintTicketBtn = document.getElementById("reprintTicketBtn");
  let printDoneTimer = null;

  function triggerTicketPrint(isManualReprint = false) {
    if (!printerMachine || !printerChute) return;

    const delaySec = isManualReprint ? "0.02s" : "0.14s";
    const totalMs = isManualReprint ? 1480 : 1600;

    printerMachine.style.setProperty("--print-delay", delaySec);
    printerChute.style.setProperty("--print-delay", delaySec);

    printerMachine.classList.remove("is-printing");
    printerChute.classList.remove("is-printing");
    const stampEl = document.getElementById("ticketStamp");
    if (stampEl) stampEl.classList.remove("stamp-pop");

    void printerChute.offsetWidth;

    if (printerStatusText) {
      printerStatusText.textContent = "PRINTING TICKET...";
    }
    printerMachine.classList.add("is-printing");
    printerChute.classList.add("is-printing");

    clearTimeout(printDoneTimer);
    printDoneTimer = setTimeout(() => {
      printerMachine.classList.remove("is-printing");
      if (printerStatusText) {
        const isSent = stampEl && stampEl.textContent === "SENT ✓";
        printerStatusText.textContent = isSent ? "CONFIRMED · SENT ✓" : "PRINTED · #06-YR ✓";
      }
    }, totalMs);
  }

  if (reprintTicketBtn) {
    reprintTicketBtn.addEventListener("click", () => {
      triggerTicketPrint(true);
    });
  }

  function goToPage(targetIdx) {
    if (targetIdx < 0 || targetIdx >= pages.length || targetIdx === currentPage) return;

    const goingForward = targetIdx > currentPage;
    currentPage = targetIdx;

    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    pages.forEach((p, idx) => {
      const active = idx === currentPage;
      p.hidden = !active;
      p.classList.remove("anim-next", "anim-prev");
      if (active) {
        void p.offsetWidth;
        p.classList.add(goingForward ? "anim-next" : "anim-prev");
      }
    });

    if (pageStage) pageStage.scrollTop = 0;
    updatePagerUI();

    if (currentPage === pages.length - 1) {
      triggerTicketPrint(false);
    }
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => goToPage(currentPage - 1));
  }
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => goToPage(currentPage + 1));
  }

  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => goToPage(currentPage + 1));
  });

  storySegs.forEach((seg) => {
    seg.addEventListener("click", () => {
      const idx = Number(seg.getAttribute("data-goto"));
      if (!Number.isNaN(idx)) goToPage(idx);
    });
  });

  // iPhone Touch Swipe Left / Right Gesture
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeIgnore = false;

  if (pageStage) {
    pageStage.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        const targetTag = e.target && e.target.tagName ? e.target.tagName : "";
        swipeIgnore = targetTag === "INPUT" || targetTag === "TEXTAREA";
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    pageStage.addEventListener(
      "touchend",
      (e) => {
        if (swipeIgnore || e.changedTouches.length !== 1) return;
        const igModalEl = document.getElementById("igModal");
        if (igModalEl && !igModalEl.hidden) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) {
            goToPage(currentPage + 1);
          } else {
            goToPage(currentPage - 1);
          }
        }
      },
      { passive: true }
    );
  }

  // Keyboard Left/Right support on Desktop
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    const igModalEl = document.getElementById("igModal");
    if (igModalEl && !igModalEl.hidden) return;

    if (e.key === "ArrowRight") {
      goToPage(currentPage + 1);
    } else if (e.key === "ArrowLeft") {
      goToPage(currentPage - 1);
    }
  });

  updatePagerUI();

  // ---------------------------------------------------------------------------
  // 4. Topbar "เจตนาแอบแฝง" Cycling Pill
  // ---------------------------------------------------------------------------
  const motiveBtn = document.getElementById("motiveBtn");
  const motiveValue = document.getElementById("motiveValue");
  const motives = [
    "ไม่มี๊ (เสียงสูง)",
    "แค่สรุปสถิติเฉย ๆ",
    "ก็แค่ชวนกินข้าวไง",
    "โอเค... มีนิดนึง 555",
    "รู้แล้วเหยียบไว้นะ 🤫🌷",
  ];
  let motiveIdx = 0;

  if (motiveBtn && motiveValue) {
    motiveBtn.addEventListener("click", () => {
      motiveIdx = (motiveIdx + 1) % motives.length;
      motiveValue.textContent = motives[motiveIdx];
    });
  }

  // Cover Cat Flower Sticker Interaction
  const coverCatBtn = document.getElementById("coverCatBtn");
  const coverCatBubble = document.getElementById("coverCatBubble");
  const catLines = [
    "อะ... เอาดอกไม้มาฝากก่อน 1 ดอก 🌹",
    "รับไปก่อน อย่าเพิ่งขำ 555",
    "ไม่ได้คิดไรเล๊ย แค่ติดมือมาเฉย ๆ 🐱",
    "โอเค กดปุ่มข้างล่างเปิดอ่านต่อได้ละ 👇",
  ];
  let catLineIdx = 0;

  if (coverCatBtn && coverCatBubble) {
    coverCatBtn.addEventListener("click", () => {
      catLineIdx = (catLineIdx + 1) % catLines.length;
      coverCatBubble.textContent = catLines[catLineIdx];
      coverCatBtn.classList.remove("wiggle");
      void coverCatBtn.offsetWidth;
      coverCatBtn.classList.add("wiggle");
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Polaroid Camera Shutter Easter Egg
  // ---------------------------------------------------------------------------
  const polaroidBtn = document.getElementById("polaroidBtn");
  const shutterFlash = document.getElementById("shutterFlash");
  const polaroidHint = document.getElementById("polaroidHint");
  const polaroidCaption = document.getElementById("polaroidCaption");
  const polaroidIcon = document.getElementById("polaroidIcon");
  let shutterCount = 0;

  if (polaroidBtn) {
    polaroidBtn.addEventListener("click", () => {
      shutterCount += 1;

      if (shutterFlash) {
        shutterFlash.classList.remove("flash-now");
        void shutterFlash.offsetWidth;
        shutterFlash.classList.add("flash-now");
      }

      if (shutterCount === 1) {
        if (polaroidIcon) polaroidIcon.textContent = "✨";
        if (polaroidHint) polaroidHint.innerHTML = "แชะ! ซ้อมกดชัตเตอร์เรียบร้อย<br/>เหลือแค่รอถ่ายของจริง";
        if (polaroidCaption) polaroidCaption.textContent = "ซ้อมมือไว้ก่อน 1 แชะ 📸";
      } else if (shutterCount === 2) {
        if (polaroidIcon) polaroidIcon.textContent = "🌷";
        if (polaroidHint) polaroidHint.innerHTML = "แสงได้ มุมได้<br/>ขาดแค่คนในเฟรมแล้วแหละ";
        if (polaroidCaption) polaroidCaption.textContent = "เมมฯ ว่างมาก พูดลอย ๆ";
      } else {
        if (polaroidIcon) polaroidIcon.textContent = "🎞️";
        if (polaroidHint) polaroidHint.innerHTML = `ซ้อมกดไป ${shutterCount} รอบแล้วนะ<br/>ต้องได้ถ่ายจริงสักใบแล้วมั้ย 555`;
        if (polaroidCaption) polaroidCaption.textContent = `${config.recipientName} + เรา — เร็ว ๆ นี้แหละ`;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Screen 3: Auto-Accordion Trait Cards & Knowledge Meter
  // ---------------------------------------------------------------------------
  const traitCards = document.querySelectorAll(".trait-card");
  const knowledgePct = document.getElementById("knowledgePct");
  const knowledgeFill = document.getElementById("knowledgeFill");
  const knowledgeSub = document.getElementById("knowledgeSub");
  const openedTraits = new Set();

  traitCards.forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-trait");
      const wasOpen = card.classList.contains("is-open");

      // Auto-close others so iPhone screen height stays compact
      traitCards.forEach((other) => {
        other.classList.remove("is-open");
        const h = other.querySelector(".trait-tap-hint");
        if (h) h.textContent = "+";
      });

      if (!wasOpen) {
        card.classList.add("is-open");
        const hint = card.querySelector(".trait-tap-hint");
        if (hint) hint.textContent = "−";
      }

      if (id !== null) {
        openedTraits.add(id);
        const pct = 18 + openedTraits.size;
        if (knowledgePct) knowledgePct.textContent = `${pct}%`;
        if (knowledgeFill) knowledgeFill.style.width = `${pct}%`;

        if (openedTraits.size === traitCards.length && knowledgeSub) {
          knowledgeSub.textContent = `เปิดครบทั้ง ${traitCards.length} ใบก็เพิ่งได้ ${pct}% เอง ยังอยากรู้อีกเยอะ 555`;
        }
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Screen 4, 5, 6: Plans, Schedule & Live Ticket
  // ---------------------------------------------------------------------------
  const planMeta = {
    food: { label: "🍜 กินข้าว" },
    flower: { label: "🌸 ดูดอกไม้ + ถ่ายรูป" },
    cafe: { label: "☕ นั่งคาเฟ่" },
  };

  const selectedPlans = new Set();
  let scheduleMode = "date";
  let selectedTimeSlot = "เวลาไหนก็ได้";

  const planCards = document.querySelectorAll(".plan-card");
  const placeInput = document.getElementById("placeInput");
  const modePickDateBtn = document.getElementById("modePickDateBtn");
  const modeLaterBtn = document.getElementById("modeLaterBtn");
  const datePickerPanel = document.getElementById("datePickerPanel");
  const laterPanel = document.getElementById("laterPanel");
  const dateInput = document.getElementById("dateInput");
  const datePreviewText = document.getElementById("datePreviewText");
  const timeSlotChips = document.querySelectorAll("#timeSlotChips .chip");
  const rapInput = document.getElementById("rapInput");
  const vinylDisc = document.getElementById("vinylDisc");
  const directMailtoLink = document.getElementById("directMailtoLink");

  if (dateInput) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    dateInput.min = `${y}-${m}-${d}`;
  }

  function formatThaiDate(isoDate) {
    if (!isoDate) return "";
    const parts = isoDate.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
    const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
    try {
      return new Intl.DateTimeFormat("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(localDate);
    } catch {
      return isoDate;
    }
  }

  function getScheduleDisplay() {
    if (scheduleMode === "later") {
      return "เดี๋ยวว่างแล้วบอกอีกที";
    }
    const rawDate = dateInput ? dateInput.value : "";
    if (!rawDate) {
      return "ยังไม่ได้จิ้มวันที่";
    }
    return `${formatThaiDate(rawDate)} (${selectedTimeSlot})`;
  }

  function getScheduleForMessage() {
    if (scheduleMode === "later") {
      return "เดี๋ยวว่างแล้วบอกอีกที";
    }
    const rawDate = dateInput ? dateInput.value : "";
    if (!rawDate) {
      return "เดี๋ยวว่างแล้วบอกอีกที";
    }
    return `${formatThaiDate(rawDate)} · ${selectedTimeSlot}`;
  }

  function buildGoogleCalendarUrl(planStr, customPlace, rapVal) {
    const rawDate = dateInput ? dateInput.value : "";
    if (scheduleMode !== "date" || !rawDate) return "";
    const [y, m, d] = rawDate.split("-").map(Number);
    const startCompact = `${String(y)}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
    const next = new Date(y, m - 1, d + 1);
    const endCompact = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(
      next.getDate()
    ).padStart(2, "0")}`;

    const title = `โปรเจกต์แก้สถิติ 6 ปี กับ${config.recipientName} (${planStr})`;
    const details = [
      `แผนที่เลือก: ${planStr}`,
      `ช่วงเวลา: ${selectedTimeSlot}`,
      customPlace ? `พิกัด/ไอเดียเสริม: ${customPlace}` : "",
      rapVal ? `เพลงแร็ปป้ายยา: ${rapVal}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startCompact}/${endCompact}&details=${encodeURIComponent(details)}`;
  }

  const heroMealStat = document.getElementById("heroMealStat");
  const heroPhotoStat = document.getElementById("heroPhotoStat");
  const factBadge2 = document.getElementById("factBadge2");
  const factBadge3 = document.getElementById("factBadge3");

  const ticketPlan = document.getElementById("ticketPlan");
  const ticketPlaceRow = document.getElementById("ticketPlaceRow");
  const ticketPlace = document.getElementById("ticketPlace");
  const ticketTiming = document.getElementById("ticketTiming");
  const ticketRap = document.getElementById("ticketRap");
  const ticketStamp = document.getElementById("ticketStamp");

  function buildReplyMessage() {
    const chosen = Array.from(selectedPlans).map((k) => planMeta[k].label);
    const customPlace = placeInput ? placeInput.value.trim() : "";
    const rapVal = rapInput ? rapInput.value.trim() : "";

    const lines = [
      `รับทราบโปรเจกต์แก้สถิติรอบ 6 ปี! 🌷`,
      `• แผนที่เลือก: ${chosen.length ? chosen.join(" + ") : "ตามใจคนชวนเลย"}`,
      `• วันนัด / ช่วงเวลา: ${getScheduleForMessage()}`,
    ];

    if (customPlace) {
      lines.push(`• พิกัด/ไอเดียเสริม: ${customPlace}`);
    }
    if (rapVal) {
      lines.push(`• เพลงแร็ปป้ายยา 🎧: ${rapVal}`);
    }

    return lines.join("\n");
  }

  function buildMailtoHref() {
    const scheduleStr = getScheduleForMessage();
    const subject = `🌷 นัดโปรเจกต์แก้สถิติ 6 ปี — จาก${config.recipientName} (${scheduleStr})`;
    const body = buildReplyMessage();
    return `mailto:${config.notifyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function syncUI() {
    if (modePickDateBtn && modeLaterBtn && datePickerPanel && laterPanel) {
      const isDateMode = scheduleMode === "date";
      modePickDateBtn.classList.toggle("active", isDateMode);
      modeLaterBtn.classList.toggle("active", !isDateMode);
      datePickerPanel.hidden = !isDateMode;
      laterPanel.hidden = isDateMode;
    }

    if (datePreviewText && dateInput) {
      if (dateInput.value) {
        datePreviewText.textContent = `✨ ${formatThaiDate(dateInput.value)}`;
        datePreviewText.classList.add("has-date");
      } else {
        datePreviewText.textContent = "จิ้มเลือกวันได้เลย";
        datePreviewText.classList.remove("has-date");
      }
    }

    const chosenLabels = Array.from(selectedPlans).map((key) => planMeta[key].label);
    const hasReadySchedule = scheduleMode === "later" || Boolean(dateInput && dateInput.value);

    if (chosenLabels.length > 0) {
      if (ticketPlan) ticketPlan.textContent = chosenLabels.join(" + ");
      if (ticketStamp && ticketStamp.textContent !== "SENT ✓") {
        ticketStamp.textContent = hasReadySchedule ? "READY 🌷" : "PICK DATE";
        ticketStamp.classList.toggle("is-ready", hasReadySchedule);
      }
    } else {
      if (ticketPlan) ticketPlan.textContent = "ยังไม่ได้จิ้มแผน";
      if (ticketStamp && ticketStamp.textContent !== "SENT ✓") {
        ticketStamp.textContent = "DRAFT";
        ticketStamp.classList.remove("is-ready");
      }
    }

    const fixesMeal = selectedPlans.has("food") || selectedPlans.has("cafe");
    if (heroMealStat) {
      heroMealStat.textContent = fixesMeal ? "รอมื้อแรก 👀" : "0 มื้อ";
      heroMealStat.classList.toggle("is-updated", fixesMeal);
    }
    if (factBadge2) {
      factBadge2.textContent = fixesMeal ? "✨ รอแก้" : "0 มื้อ";
      factBadge2.className = fixesMeal ? "fact-badge badge-pending" : "fact-badge badge-warn";
    }

    const fixesPhoto = selectedPlans.has("flower") || selectedPlans.size > 0;
    if (heroPhotoStat) {
      heroPhotoStat.textContent = fixesPhoto ? "รอรูปแรก 📸" : "0 ใบ";
      heroPhotoStat.classList.toggle("is-updated", fixesPhoto);
    }
    if (factBadge3) {
      factBadge3.textContent = fixesPhoto ? "📸 รอถ่าย" : "0 ใบ";
      factBadge3.className = fixesPhoto ? "fact-badge badge-pending" : "fact-badge badge-warn";
    }

    const customPlace = placeInput ? placeInput.value.trim() : "";
    if (ticketPlaceRow && ticketPlace) {
      if (customPlace) {
        ticketPlaceRow.hidden = false;
        ticketPlace.textContent = customPlace;
      } else {
        ticketPlaceRow.hidden = true;
      }
    }

    if (ticketTiming) {
      ticketTiming.textContent = getScheduleDisplay();
    }

    const rapVal = rapInput ? rapInput.value.trim() : "";
    if (ticketRap) {
      ticketRap.textContent = rapVal || "รอเทลส่งมาป้ายยา";
    }
    if (vinylDisc) {
      const isFocused = document.activeElement === rapInput;
      vinylDisc.classList.toggle("is-spinning", Boolean(rapVal) || isFocused);
    }

    if (directMailtoLink) {
      directMailtoLink.href = buildMailtoHref();
    }
  }

  planCards.forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.getAttribute("data-plan");
      if (!key) return;

      if (selectedPlans.has(key)) {
        selectedPlans.delete(key);
        card.classList.remove("is-selected");
        card.setAttribute("aria-pressed", "false");
      } else {
        selectedPlans.add(key);
        card.classList.add("is-selected");
        card.setAttribute("aria-pressed", "true");
      }
      syncUI();
    });
  });

  if (modePickDateBtn) {
    modePickDateBtn.addEventListener("click", () => {
      scheduleMode = "date";
      syncUI();
    });
  }

  if (modeLaterBtn) {
    modeLaterBtn.addEventListener("click", () => {
      scheduleMode = "later";
      syncUI();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      scheduleMode = "date";
      syncUI();
    });
    dateInput.addEventListener("input", () => {
      scheduleMode = "date";
      syncUI();
    });
  }

  timeSlotChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      timeSlotChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedTimeSlot = chip.getAttribute("data-slot") || "เวลาไหนก็ได้";
      syncUI();
    });
  });

  if (placeInput) {
    placeInput.addEventListener("input", syncUI);
  }

  if (rapInput) {
    rapInput.addEventListener("input", syncUI);
    rapInput.addEventListener("focus", syncUI);
    rapInput.addEventListener("blur", syncUI);
  }

  const secretReasonBtn = document.getElementById("secretReasonBtn");
  const secretReasonBox = document.getElementById("secretReasonBox");

  if (secretReasonBtn && secretReasonBox) {
    secretReasonBtn.addEventListener("click", () => {
      const willShow = secretReasonBox.hidden;
      secretReasonBox.hidden = !willShow;
      secretReasonBtn.textContent = willShow ? "(ซ่อนไว้ 🤫)" : "(กดเช็กคำตอบ)";
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Cross-Screen Validation, Email Send & Copy Reply
  // ---------------------------------------------------------------------------
  const sendEmailBtn = document.getElementById("sendEmailBtn");
  const sendEmailBtnLabel = document.getElementById("sendEmailBtnLabel");
  const emailStatusBox = document.getElementById("emailStatusBox");
  const copyReplyBtn = document.getElementById("copyReplyBtn");

  function validateBeforeAction() {
    if (selectedPlans.size === 0) {
      goToPage(3); // Screen 4: Choose Plan
      showToast("แวะจิ้มเลือกแผนหน้านี้สักอันก่อนน้า 👆");
      return false;
    }

    if (scheduleMode === "date" && !(dateInput && dateInput.value)) {
      goToPage(4); // Screen 5: Pick Date or Later
      showToast("จิ้มเลือกวัน หรือกด 'เดี๋ยวว่างแล้วบอกอีกที' ก่อนน้า 🗓️");
      return false;
    }

    return true;
  }

  let isSendingInFlight = false;

  async function sendScheduleToEmail() {
    if (!validateBeforeAction() || isSendingInFlight) return;

    const chosen = Array.from(selectedPlans).map((k) => planMeta[k].label);
    const planStr = chosen.join(" + ");
    const scheduleStr = getScheduleForMessage();
    const customPlace = placeInput ? placeInput.value.trim() : "";
    const rapVal = rapInput ? rapInput.value.trim() : "";
    const gcalUrl = buildGoogleCalendarUrl(planStr, customPlace, rapVal);
    const mailtoHref = buildMailtoHref();

    if (window.location.protocol === "file:") {
      if (emailStatusBox) {
        emailStatusBox.hidden = false;
        emailStatusBox.className = "email-status-box is-info";
        emailStatusBox.innerHTML =
          `📩 เปิดผ่านไฟล์ในเครื่อง กด <a href="${mailtoHref}">ส่งผ่านแอปอีเมลตรงนี้</a> หรือกดคัดลอกส่งแชทได้เลยนะ 🌷`;
      }
      return;
    }

    isSendingInFlight = true;
    if (sendEmailBtn) sendEmailBtn.disabled = true;
    if (sendEmailBtnLabel) sendEmailBtnLabel.textContent = "กำลังปั๊มตั๋วยืนยัน... 🌷";

    const payload = {
      _subject: `🌷 นัดโปรเจกต์แก้สถิติ 6 ปี จาก${config.recipientName} (${scheduleStr})`,
      _template: "table",
      _captcha: "false",
      ผู้ตอบ: config.recipientName,
      แผนที่เลือก: planStr,
      "วันนัด / ช่วงเวลา": scheduleStr,
      "พิกัด/ร้านที่อยากไป": customPlace || "ไม่ได้ระบุเพิ่ม (ตามไอเดียในเว็บ)",
      "เพลงแร็ปแนะนำ 🎧": rapVal || "ยังไม่ได้ระบุ",
    };

    if (gcalUrl) {
      payload["เพิ่มลง Google Calendar"] = gcalUrl;
    }

    // Fire background request with literal '@' (FormSubmit spec), keepalive, and 15s safety timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const requestPromise = fetch(`https://formsubmit.co/ajax/${config.notifyEmail.trim()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, data };
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    // Snappy 380ms optimistic UI confirmation so the button NEVER hangs waiting on slow SMTP
    await new Promise((r) => setTimeout(r, 380));

    if (ticketStamp) {
      ticketStamp.textContent = "SENT ✓";
      ticketStamp.classList.add("is-ready");
      ticketStamp.classList.remove("stamp-pop");
      void ticketStamp.offsetWidth;
      ticketStamp.classList.add("stamp-pop");
    }
    if (printerStatusText) {
      printerStatusText.textContent = "CONFIRMED · SENT ✓";
    }
    if (sendEmailBtn) sendEmailBtn.disabled = false;
    if (sendEmailBtnLabel) sendEmailBtnLabel.textContent = "✓ ยืนยันนัดเรียบร้อยแล้ว";
    if (emailStatusBox) {
      emailStatusBox.hidden = false;
      emailStatusBox.className = "email-status-box is-success";
      emailStatusBox.textContent = `✅ บันทึกและส่งวันนัดเรียบร้อยแล้ว! ขอบคุณนะ${config.recipientName} ไว้เจอกัน 🌷`;
    }
    showToast("ยืนยันตั๋วนัดเรียบร้อยแล้ว! 🌷");
    isSendingInFlight = false;

    // Handle background response silently (surface one-time Activate notice if needed, never auto-open Outlook)
    requestPromise
      .then(({ ok, data }) => {
        const msg = data && typeof data.message === "string" ? data.message : "";
        if (/activat/i.test(msg)) {
          if (sendEmailBtnLabel) sendEmailBtnLabel.textContent = "📩 ยืนยันนัด & ส่งเข้าเมลเลย";
          if (emailStatusBox) {
            emailStatusBox.hidden = false;
            emailStatusBox.className = "email-status-box is-info";
            emailStatusBox.innerHTML =
              `📬 ส่งลิงก์ยืนยันครั้งแรก (<strong>Activate Form</strong>) ไปที่ <strong>${config.notifyEmail}</strong> แล้วครับ ` +
              `(เปิด Gmail กด Activate ครั้งเดียว ครั้งต่อไปเข้าเมลอัตโนมัติเลย)`;
          }
        } else if (!ok && !(data && (data.success === "true" || data.success === true))) {
          if (emailStatusBox) {
            emailStatusBox.hidden = false;
            emailStatusBox.className = "email-status-box is-info";
            emailStatusBox.innerHTML =
              `📌 ปั๊มตั๋วเรียบร้อย! เซิร์ฟเวอร์เมลตอบช้านิดนึง กดคัดลอกส่งแชท หรือ <a href="${mailtoHref}">ส่งผ่านแอปอีเมล</a> สำรองได้นะ`;
          }
        }
      })
      .catch(() => {
        if (emailStatusBox) {
          emailStatusBox.hidden = false;
          emailStatusBox.className = "email-status-box is-info";
          emailStatusBox.innerHTML =
            `📌 ปั๊มตั๋วเรียบร้อย! หากต้องการส่งสำรอง กดปุ่มคัดลอกส่งแชท หรือ <a href="${mailtoHref}">ส่งผ่านแอปอีเมลตรงนี้ได้นะ</a>`;
        }
      });
  }

  if (sendEmailBtn) {
    sendEmailBtn.addEventListener("click", sendScheduleToEmail);
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  if (copyReplyBtn) {
    copyReplyBtn.addEventListener("click", async () => {
      if (!validateBeforeAction()) return;

      try {
        await copyToClipboard(buildReplyMessage());
        showToast("คัดลอกคำตอบแล้ว! วางส่งในแชทได้เลย 🌷");
      } catch {
        showToast("แคปหน้าจอตั๋วด้านบนส่งแทนได้เลยนะ 📸");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 9. iPhone Share Sheet + High-DPI Ticket PNG Generator
  // ---------------------------------------------------------------------------
  const downloadTicketBtn = document.getElementById("downloadTicketBtn");

  function wrapCanvasText(ctx, text, maxWidth) {
    if (!text) return ["-"];
    let segments = [];
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("th", { granularity: "word" });
      segments = Array.from(segmenter.segment(text), (s) => s.segment);
    } else {
      segments = text.split("");
    }

    const lines = [];
    let current = "";

    for (const seg of segments) {
      const test = current + seg;
      if (ctx.measureText(test).width > maxWidth && current.length > 0) {
        lines.push(current.trim());
        current = seg.trimStart();
      } else {
        current = test;
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines.length ? lines : [text];
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function shareOrDownloadTicketImage() {
    if (!validateBeforeAction()) return;

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const chosen = Array.from(selectedPlans).map((k) => planMeta[k].label);
    const planStr = chosen.length ? chosen.join(" + ") : "ตามใจคนชวนเลย";
    const placeStr = placeInput ? placeInput.value.trim() : "";
    const scheduleStr = getScheduleForMessage();
    const rapStr = rapInput && rapInput.value.trim() ? rapInput.value.trim() : "เดี๋ยวส่งตามไปในแชท";

    const width = 640;
    const padX = 48;
    const cardX = 28;
    const cardW = width - cardX * 2;

    const tempCanvas = document.createElement("canvas");
    const tCtx = tempCanvas.getContext("2d");
    tCtx.font = '600 20px "Anuphan", sans-serif';

    const rows = [
      { label: "ผู้ถือตั๋ว", val: `${config.recipientName} 🌷`, accent: false },
      { label: "แผนที่เลือก", val: planStr, accent: true },
    ];
    if (placeStr) {
      rows.push({ label: "พิกัดเสริม", val: placeStr, accent: false });
    }
    rows.push({ label: "วันนัด / เวลา", val: scheduleStr, accent: false });
    rows.push({ label: "เพลงแร็ป 🎧", val: rapStr, accent: false });

    const maxValWidth = cardW - 210;
    let rowsTotalHeight = 0;
    const measuredRows = rows.map((r) => {
      const lines = wrapCanvasText(tCtx, r.val, maxValWidth);
      const rowH = Math.max(34, lines.length * 30) + 16;
      rowsTotalHeight += rowH;
      return { ...r, lines, rowH };
    });

    const height = 210 + rowsTotalHeight + 100;
    const dpr = 2;

    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(width * 0.85, 60, 10, width * 0.85, 60, 260);
    grad.addColorStop(0, "rgba(216, 100, 78, 0.10)");
    grad.addColorStop(1, "rgba(216, 100, 78, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cardY = 28;
    const cardH = height - 56;
    ctx.save();
    ctx.shadowColor = "rgba(31, 30, 28, 0.08)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    roundRect(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    roundRect(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#CFC7BA";
    ctx.stroke();

    ctx.fillStyle = "#8B847B";
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText("PROJECT TICKET // #06-YR", padX + 12, cardY + 46);

    ctx.fillStyle = "#1F1E1C";
    ctx.font = '700 26px "Anuphan", sans-serif';
    ctx.fillText("ใบรับทราบโปรเจกต์แก้สถิติ 6 ปี", padX + 12, cardY + 82);

    const perfY = cardY + 114;
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = "#E5DFD5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 14, perfY);
    ctx.lineTo(cardX + cardW - 14, perfY);
    ctx.stroke();
    ctx.restore();

    [cardX, cardX + cardW].forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, perfY, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#FAF7F2";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        cx,
        perfY,
        12,
        cx === cardX ? -Math.PI * 0.5 : Math.PI * 0.5,
        cx === cardX ? Math.PI * 0.5 : Math.PI * 1.5
      );
      ctx.strokeStyle = "#CFC7BA";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    let curY = perfY + 44;
    measuredRows.forEach((row) => {
      ctx.fillStyle = "#8B847B";
      ctx.font = '500 18px "Anuphan", sans-serif';
      ctx.textAlign = "left";
      ctx.fillText(row.label, padX + 12, curY);

      ctx.fillStyle = row.accent ? "#D8644E" : "#1F1E1C";
      ctx.font = '600 20px "Anuphan", sans-serif';
      ctx.textAlign = "right";
      row.lines.forEach((line, idx) => {
        ctx.fillText(line, cardX + cardW - 32, curY + idx * 29);
      });

      curY += row.rowH;
    });

    const footY = cardY + cardH - 68;
    ctx.strokeStyle = "#EAE4DA";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX + 12, footY);
    ctx.lineTo(cardX + cardW - 32, footY);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#5E5952";
    ctx.font = '500 17px "Anuphan", sans-serif';
    ctx.fillText(`จาก ${config.senderName}`, padX + 12, footY + 38);

    ctx.save();
    ctx.translate(cardX + cardW - 88, footY + 32);
    ctx.rotate(-0.06);
    roundRect(ctx, -56, -18, 112, 32, 7);
    ctx.fillStyle = "#E7F1EA";
    ctx.fill();
    ctx.strokeStyle = "#4A7856";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#4A7856";
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText("CONFIRMED", 0, 3);
    ctx.restore();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob && navigator.canShare) {
      const file = new File([blob], "tell-project-ticket.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "ตั๋วโปรเจกต์แก้สถิติ 6 ปี 🌷",
          });
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "tell-project-ticket.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("เซฟรูปตั๋วเรียบร้อย! ส่งมาในแชทได้เลย 🎟️🌷");
  }

  if (downloadTicketBtn) {
    downloadTicketBtn.addEventListener("click", () => {
      shareOrDownloadTicketImage().catch(() => {
        showToast("แคปหน้าจอตั๋วส่งมาแทนได้เลยน้า 📸");
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Cheeky Lookalike Image Popup Modal
  // ---------------------------------------------------------------------------
  const openIgPopupBtn = document.getElementById("openIgPopupBtn");
  const closeIgPopupBtn = document.getElementById("closeIgPopupBtn");
  const igModal = document.getElementById("igModal");
  const igModalBackdrop = document.getElementById("igModalBackdrop");
  const lookalikePopupImg = document.getElementById("lookalikePopupImg");

  if (lookalikePopupImg && config.lookalikeImage) {
    lookalikePopupImg.src = config.lookalikeImage;
  }

  function openIgModal() {
    if (!igModal) return;
    igModal.hidden = false;
  }

  function closeIgModal() {
    if (!igModal) return;
    igModal.hidden = true;
  }

  if (openIgPopupBtn) {
    openIgPopupBtn.addEventListener("click", openIgModal);
  }
  if (closeIgPopupBtn) {
    closeIgPopupBtn.addEventListener("click", closeIgModal);
  }
  if (igModalBackdrop) {
    igModalBackdrop.addEventListener("click", closeIgModal);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && igModal && !igModal.hidden) {
      closeIgModal();
    }
  });

  // Initial UI sync
  syncUI();
})();
