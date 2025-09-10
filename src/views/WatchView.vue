<template>
  <div class="watch-view min-h-screen bg-black text-white">
    <!-- Loading State - Mobile Optimized -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen px-4">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-red-500 mx-auto"
        ></div>
        <p class="text-lg md:text-xl mt-4 text-gray-300">Loading movie...</p>
      </div>
    </div>

    <!-- Error State - Mobile Optimized -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen px-4">
      <div class="text-center max-w-md">
        <div class="text-4xl md:text-6xl mb-4">⚠️</div>
        <h1 class="text-2xl md:text-3xl font-bold mb-4">Oops! Something went wrong</h1>
        <p class="text-gray-300 mb-6 text-sm md:text-base">{{ error }}</p>
        <button
          @click="$router.go(-1)"
          class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Main Watch Interface -->
    <div v-else-if="content" class="relative">
      <!-- Video Player Section -->
      <section class="relative bg-black">
        <!-- Video Container - Mobile First -->
        <div
          class="relative w-full"
          :class="isFullWatchMode ? 'h-screen' : 'aspect-video max-h-[60vh] md:max-h-[80vh]'"
        >
          <!-- YouTube Player (Auto-start) -->
          <div v-if="hasStartedWatching && currentVideo" class="relative w-full h-full bg-black">
            <!-- YouTube Player -->
            <div class="relative w-full h-full bg-black" ref="youtubePlayerContainer">
              <div id="youtube-player" class="w-full h-full"></div>

              <!-- Video Info Overlay - Mobile Optimized -->
              <div
                class="absolute top-2 left-2 md:top-4 md:left-4 bg-black/70 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg max-w-[calc(100%-1rem)] md:max-w-none"
              >
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span class="text-white text-xs md:text-sm font-medium truncate">
                    {{ currentVideo.type }} • {{ currentVideo.name }}
                  </span>
                </div>
              </div>

              <!-- Loading Overlay -->
              <div
                v-if="playerLoading"
                class="absolute inset-0 bg-black/90 flex items-center justify-center"
              >
                <div class="text-center">
                  <div
                    class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"
                  ></div>
                  <p class="text-white text-lg">Loading video...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- No Video Available -->
          <div
            v-else-if="hasStartedWatching && !currentVideo"
            class="absolute inset-0 bg-black flex items-center justify-center"
          >
            <div class="text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <h3 class="text-2xl font-bold text-white mb-4">No Videos Available</h3>
              <p class="text-gray-300 mb-6">No videos are currently available for this movie.</p>
              <button
                @click="$router.go(-1)"
                class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg text-white font-semibold transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>

          <!-- Loading Poster (while initializing auto-start) -->
          <div v-else class="relative w-full h-full bg-gray-900 flex items-center justify-center">
            <!-- Background Poster -->
            <div
              class="absolute inset-0 bg-cover bg-center"
              :style="{
                backgroundImage: `url(${getBackdropUrl(content.backdrop_path || content.poster_path)})`,
              }"
            >
              <div class="absolute inset-0 bg-black/60"></div>
            </div>

            <!-- Auto-starting indicator -->
            <div class="relative z-10 text-center">
              <div
                class="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto transition-all duration-300 shadow-2xl animate-pulse"
              >
                <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold mb-2 text-white">
                {{ content?.title || content?.name }}
              </h2>
              <p class="text-gray-300">Starting playback...</p>
            </div>
          </div>
        </div>

        <!-- Custom Video Controls (Non-overlapping) -->
        <div
          v-if="hasStartedWatching && !isFullWatchMode"
          class="relative bg-gradient-to-t from-black via-gray-900/95 to-gray-900/80 backdrop-blur-sm border-t border-gray-700/50"
        >
          <!-- Controls Container -->
          <div class="max-w-7xl mx-auto px-6 py-4">
            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex items-center gap-3 text-sm text-gray-300 mb-2">
                <span class="font-mono">{{ formatTime(currentTime) }}</span>
                <div class="flex-1 relative">
                  <div
                    class="h-1 bg-gray-700 rounded-full cursor-pointer"
                    @click="seekTo"
                    ref="progressBar"
                  >
                    <div
                      class="h-full bg-red-500 rounded-full transition-all duration-300"
                      :style="{ width: `${progressPercentage}%` }"
                    ></div>
                    <!-- Progress Handle -->
                    <div
                      class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg transition-all duration-300"
                      :style="{ left: `${progressPercentage}%`, marginLeft: '-6px' }"
                    ></div>
                  </div>
                </div>
                <span class="font-mono">{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- Control Buttons -->
            <div class="flex items-center justify-between">
              <!-- Left Controls -->
              <div class="flex items-center gap-4">
                <!-- Play/Pause Button -->
                <button
                  @click="togglePlayPause"
                  class="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                >
                  <svg
                    v-if="!isPlaying"
                    class="w-5 h-5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                    />
                  </svg>
                  <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <!-- Volume Controls -->
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleMute"
                    class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300"
                  >
                    <svg
                      v-if="!isMuted && volume > 50"
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.814zm2.617 3.72a1 1 0 011.414 0 5 5 0 010 7.07 1 1 0 01-1.414-1.414 3 3 0 000-4.242 1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <svg
                      v-else-if="!isMuted && volume > 0"
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.814z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <svg v-else class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.814zm7.824 5.61a1 1 0 00-1.414-1.414L14 9.586l-1.793-1.793a1 1 0 00-1.414 1.414L12.586 11l-1.793 1.793a1 1 0 101.414 1.414L14 12.414l1.793 1.793a1 1 0 001.414-1.414L15.414 11l1.793-1.793z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <div class="w-20 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      :value="volume"
                      @input="setVolume"
                      class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <!-- Movie Info -->
                <div class="ml-4">
                  <h3 class="text-white font-semibold text-sm">
                    {{ content?.title || content?.name }}
                  </h3>
                  <p class="text-gray-400 text-xs">{{ getCurrentVideoInfo() }}</p>
                </div>
              </div>

              <!-- Right Controls -->
              <div class="flex items-center gap-3">
                <!-- Info Button -->
                <button
                  @click="showMovieInfo = !showMovieInfo"
                  class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300"
                  :class="showMovieInfo ? 'bg-red-600 hover:bg-red-500' : ''"
                >
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <!-- Full Watch Mode Toggle -->
                <button
                  @click="toggleFullWatchMode"
                  class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  {{ isFullWatchMode ? 'Exit Full Watch' : 'Full Watch' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Movie Information Section (Collapsible) -->
      <section
        v-if="!isFullWatchMode"
        class="bg-gradient-to-b from-gray-900 to-gray-800 transition-all duration-500"
      >
        <div class="max-w-7xl mx-auto px-6 py-8">
          <!-- Movie Info Header -->
          <div class="flex items-start justify-between mb-6 font-thin">
            <div class="flex-1">
              <h1 class="text-2xl text-white mb-2">
                {{ content?.title || content?.name }}
              </h1>
              <div class="flex items-center gap-4 text-gray-300">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400">⭐</span>
                  <span class="font-semibold">{{ content?.vote_average?.toFixed(1) }}</span>
                </div>
                <span>{{ formatDate(content?.release_date || content?.first_air_date) }}</span>
                <span v-if="content?.runtime">{{ content.runtime }} min</span>
                <span class="px-2 py-1 bg-gray-700 rounded text-sm">
                  {{ contentType === 'movie' ? 'Movie' : 'TV Series' }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 ml-6">
              <button
                @click="userStore.toggleLike(content)"
                class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                :class="
                  userStore.isMovieLiked(content.id)
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                "
              >
                {{ userStore.isMovieLiked(content.id) ? '❤️ Liked' : '🤍 Add to Favorites' }}
              </button>
            </div>
          </div>

          <!-- Expandable Movie Details -->
          <div
            class="transition-all duration-500 overflow-hidden"
            :class="showMovieInfo ? 'max-h-96 opacity-100' : 'max-h-20 opacity-70'"
          >
            <!-- Overview -->
            <div class="mb-6 font-thin">
              <p class="text-gray-300 text-lg leading-relaxed">
                {{ content?.overview || 'No description available.' }}
              </p>
            </div>

            <!-- Additional Details -->
            <div v-if="showMovieInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div v-if="content?.genres?.length">
                  <span class="text-gray-400 font-medium">Genres:</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span
                      v-for="genre in content.genres"
                      :key="genre.id"
                      class="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>

                <div v-if="content?.production_companies?.length">
                  <span class="text-gray-400 font-medium">Production:</span>
                  <p class="text-gray-300 mt-1">
                    {{ content.production_companies.map(c => c.name).join(', ') }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div v-if="content?.vote_count">
                  <span class="text-gray-400 font-medium">Votes:</span>
                  <p class="text-gray-300 mt-1">{{ content.vote_count.toLocaleString() }}</p>
                </div>

                <div v-if="content?.budget">
                  <span class="text-gray-400 font-medium">Budget:</span>
                  <p class="text-gray-300 mt-1">${{ content.budget.toLocaleString() }}</p>
                </div>

                <div v-if="content?.revenue">
                  <span class="text-gray-400 font-medium">Revenue:</span>
                  <p class="text-gray-300 mt-1">${{ content.revenue.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Show More/Less Button -->
          <button
            @click="showMovieInfo = !showMovieInfo"
            class="mt-4 text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-2"
          >
            {{ showMovieInfo ? 'Show Less' : 'Show More Details' }}
            <svg
              class="w-4 h-4 transition-transform duration-300"
              :class="showMovieInfo ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </section>

      <!-- Netflix-like Video Selector - Mobile First -->
      <section
        v-if="!isFullWatchMode && movieVideos.length > 1"
        class="bg-gradient-to-b from-gray-800 to-gray-900 py-6 md:py-8"
      >
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <h2
            class="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center justify-center md:justify-start gap-2 md:gap-3"
          >
            <div
              class="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center text-sm md:text-base"
            >
              🎥
            </div>
            Trailers & Videos
          </h2>

          <!-- Video List (First 5 + Show More) - Mobile Optimized -->
          <div class="space-y-3 md:space-y-4">
            <div
              v-for="video in displayedVideos"
              :key="video.key"
              class="group flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
              :class="
                currentVideo?.key === video.key
                  ? 'bg-red-600/20 border border-red-500/50'
                  : 'bg-gray-800/50 hover:bg-gray-800/80 active:bg-gray-800'
              "
              @click="switchToVideo(video)"
            >
              <!-- Video Number - Mobile Optimized -->
              <div
                class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm group-hover:bg-red-600 transition-colors"
              >
                {{ sortedVideos.findIndex(v => v.key === video.key) + 1 }}
              </div>

              <!-- Video Thumbnail - Mobile Smaller -->
              <div
                class="flex-shrink-0 w-20 h-12 md:w-24 md:h-16 bg-gray-700 rounded-lg overflow-hidden"
              >
                <img
                  :src="getVideoThumbnail(video)"
                  :alt="video.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <!-- Video Info - Mobile Optimized -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 md:gap-4">
                  <div class="flex-1 min-w-0">
                    <h3
                      class="text-white font-semibold text-sm md:text-base mb-1 group-hover:text-red-300 transition-colors line-clamp-1"
                    >
                      {{ video.name }}
                    </h3>
                    <div
                      class="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400 mb-2"
                    >
                      <span class="px-2 py-1 bg-gray-700 rounded text-xs font-medium">
                        {{ video.type }}
                      </span>
                      <span
                        v-if="video.official"
                        class="px-2 py-1 bg-blue-600 rounded text-xs font-medium text-white"
                      >
                        Official
                      </span>
                      <span class="text-gray-500 hidden md:inline">{{
                        getVideoQuality(video)
                      }}</span>
                    </div>
                    <p
                      class="text-gray-300 text-xs md:text-sm leading-relaxed line-clamp-1 md:line-clamp-2 hidden sm:block"
                    >
                      {{ getVideoDescription(video) }}
                    </p>
                  </div>

                  <!-- Play Button - Smaller on Mobile -->
                  <div class="flex-shrink-0">
                    <div
                      class="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors"
                    >
                      <svg
                        class="w-3 h-3 md:w-4 md:h-4 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Show More/Less Button - Mobile Full Width -->
          <div v-if="sortedVideos.length > 5" class="text-center mt-4 md:mt-6">
            <button
              @click="showAllVideos = !showAllVideos"
              class="w-full sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 mx-auto text-sm md:text-base active:scale-95"
            >
              <span>{{
                showAllVideos ? 'Show Less' : `Show All ${sortedVideos.length} Videos`
              }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-300"
                :class="showAllVideos ? 'rotate-180' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Similar Content Recommendations (Completely Separated at Bottom) - Mobile First -->
      <section
        v-if="!isFullWatchMode && hasStartedWatching"
        class="bg-black py-12 md:py-16 mt-8 md:mt-12 border-t-2 border-gray-800"
      >
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <!-- Section Tabs - Mobile Optimized -->
          <div class="flex items-center justify-center mb-6 md:mb-8">
            <div
              class="bg-gray-800/80 backdrop-blur-lg rounded-xl p-1 border border-gray-700/50 w-full max-w-md"
            >
              <div class="flex gap-1">
                <button
                  @click="setRecommendationType('similar')"
                  class="relative flex-1 px-3 py-2 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 text-center"
                  :class="
                    recommendationType === 'similar'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  "
                >
                  <span class="hidden sm:inline"
                    >Similar {{ contentType === 'movie' ? 'Movies' : 'Series' }}</span
                  >
                  <span class="sm:hidden">Similar</span>
                </button>
                <button
                  @click="setRecommendationType('recommendations')"
                  class="relative flex-1 px-3 py-2 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 text-center"
                  :class="
                    recommendationType === 'recommendations'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  "
                >
                  <span class="hidden sm:inline">Recommended for You</span>
                  <span class="sm:hidden">For You</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section Title - Mobile Centered -->
          <div class="text-center mb-6 md:mb-8">
            <h2
              class="text-xl md:text-2xl font-bold text-white flex items-center justify-center gap-2 md:gap-3"
            >
              <div
                class="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r rounded-xl flex items-center justify-center text-base md:text-lg"
                :class="
                  recommendationType === 'similar'
                    ? 'from-red-500 to-red-600'
                    : 'from-purple-500 to-purple-600'
                "
              >
                {{ recommendationType === 'similar' ? '🎭' : '🎯' }}
              </div>
              <span class="text-lg md:text-2xl">{{ getSectionTitle() }}</span>
            </h2>
            <p
              class="text-gray-400 mt-2 text-sm md:text-base"
              v-if="!similarLoading && similarContent.length > 0"
            >
              {{ similarContent.length }} {{ contentType === 'movie' ? 'movies' : 'series' }} found
            </p>
          </div>

          <!-- Loading State -->
          <SkeletonLoader v-if="similarLoading" type="movie-grid" :count="18" />

          <!-- Error State -->
          <div v-else-if="similarError" class="text-center py-12">
            <div class="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 class="text-xl font-semibold text-white mb-2">Failed to Load Content</h3>
            <p class="text-gray-400 mb-4">{{ similarError }}</p>
            <button
              @click="loadSimilarContent"
              class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Similar Content Grid - Mobile First -->
          <div
            v-else-if="similarContent.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6"
          >
            <div
              v-for="(item, index) in similarContent.slice(0, 18)"
              :key="`${item.id}-${recommendationType}`"
              class="group cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="watchSimilarContent(item)"
            >
              <!-- Content Poster - Mobile Optimized -->
              <div
                class="relative aspect-[2/3] overflow-hidden rounded-lg md:rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300"
              >
                <!-- Main Image -->
                <img
                  :src="getContentPoster(item.poster_path)"
                  :alt="getContentTitle(item)"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />

                <!-- Hover Overlay - Always visible on mobile -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div class="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                    <!-- Play Button - Smaller on mobile -->
                    <div class="flex items-center justify-center mb-2">
                      <div
                        class="w-8 h-8 md:w-12 md:h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors"
                      >
                        <svg
                          class="w-3 h-3 md:w-5 md:h-5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                          />
                        </svg>
                      </div>
                    </div>

                    <!-- Content Info - Mobile Optimized -->
                    <h3 class="text-white font-semibold text-xs md:text-sm mb-1 line-clamp-2">
                      {{ getContentTitle(item) }}
                    </h3>
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-1 text-yellow-400">
                        <span>⭐</span>
                        <span>{{ item.vote_average.toFixed(1) }}</span>
                      </div>
                      <span class="text-gray-300">{{ getContentYear(item) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Media Type Badge - Smaller on mobile -->
                <div
                  class="absolute top-1 right-1 md:top-2 md:right-2 px-1 py-0.5 md:px-2 md:py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium"
                >
                  {{ contentType === 'movie' ? 'Movie' : 'Series' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="text-gray-500 text-4xl mb-4">🎬</div>
            <h3 class="text-xl font-semibold text-white mb-2">No Similar Content Found</h3>
            <p class="text-gray-400">
              We couldn't find any similar {{ contentType === 'movie' ? 'movies' : 'series' }} at
              the moment.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Add YouTube API types to window
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  TMDBAPI,
  getSimilarMovies,
  getSimilarTVSeries,
  getMovieRecommendations,
  getTVSeriesRecommendations,
} from '@/api/tmdb'
import { getImageUrl } from '@/api/tmdb'
import type { MovieDetails, MovieVideo, Movie, TVSeries } from '@/types/movie'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { useUserStore } from '@/stores'

// Extended type for both movies and series
interface WatchContent extends MovieDetails {
  name?: string // TV series name
  first_air_date?: string // TV series first air date
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: any[]
}

// Props
const props = defineProps<{
  id: string
}>()

// Composables
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// State
const content = ref<WatchContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const hasStartedWatching = ref(false)
const isFullWatchMode = ref(false)
const showMovieInfo = ref(false)
const currentVideo = ref<MovieVideo | null>(null)
const showAllVideos = ref(false)
const watchTimer = ref<number | null>(null)

// Video data from TMDB
const movieVideos = ref<MovieVideo[]>([])
const loadingVideos = ref(false)
const videoError = ref<string | null>(null)

// YouTube Player state
const playerLoading = ref(false)
const youtubePlayer = ref<any>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(100)
const isMuted = ref(false)
const progressBar = ref<HTMLElement | null>(null)

// Player update interval
const playerUpdateInterval = ref<number | null>(null)

// Similar Content state
const similarContent = ref<(Movie | TVSeries)[]>([])
const similarLoading = ref(false)
const similarError = ref<string | null>(null)
const recommendationType = ref<'similar' | 'recommendations'>('similar')

// Computed
const isMovie = computed(() => route.name === 'watch-movie')
const contentType = computed(() => (isMovie.value ? 'movie' : 'series'))

const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// Netflix-like sorted videos
const sortedVideos = computed(() => {
  if (movieVideos.value.length === 0) return []

  // Sort by priority: Official trailers first, then other types
  const priorityOrder = ['Trailer', 'Featurette', 'Clip', 'Teaser', 'Behind the Scenes']

  return [...movieVideos.value]
    .filter(v => v.site === 'YouTube')
    .sort((a, b) => {
      // Official videos first
      if (a.official !== b.official) {
        return b.official ? 1 : -1
      }

      // Then by type priority
      const aIndex = priorityOrder.indexOf(a.type)
      const bIndex = priorityOrder.indexOf(b.type)
      const aPriority = aIndex === -1 ? 999 : aIndex
      const bPriority = bIndex === -1 ? 999 : bIndex

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Finally by name alphabetically
      return a.name.localeCompare(b.name)
    })
})

// Videos to display (first 5 or all if expanded)
const displayedVideos = computed(() => {
  if (showAllVideos.value || sortedVideos.value.length <= 5) {
    return sortedVideos.value
  }
  return sortedVideos.value.slice(0, 5)
})

// Methods
const loadContent = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await TMDBAPI.getMovieDetails(Number(props.id))

    if (response.success && response.data) {
      content.value = response.data

      // Load video data
      await loadMovieVideos(Number(props.id))
    } else {
      throw new Error(response.error || `Failed to load ${contentType.value}`)
    }
  } catch (err: any) {
    console.warn(`❌ Error loading ${contentType.value}:`, err.message)
    error.value = err.message || `Failed to load ${contentType.value}`
  } finally {
    loading.value = false
  }
}

const loadMovieVideos = async (movieId: number) => {
  loadingVideos.value = true
  videoError.value = null

  try {
    const response = await TMDBAPI.getMovieVideos(movieId)

    if (response.success && response.data) {
      movieVideos.value = response.data.results

      // Filter for the best video options (trailers, clips)
    } else {
      console.warn('⚠️ No videos found for this movie')
    }
  } catch (err: any) {
    console.warn(`❌ Error loading videos:`, err.message)
    videoError.value = err.message || 'Failed to load videos'
  } finally {
    loadingVideos.value = false
  }
}

const getBackdropUrl = (path: string | null): string => {
  if (!path) return 'https://via.placeholder.com/1920x1080/1a1a1a/666666?text=No+Image'
  return `https://image.tmdb.org/t/p/w1280${path}`
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const startWatching = async () => {
  hasStartedWatching.value = true

  // Wait for videos to be available, then auto-select the best one
  if (movieVideos.value.length > 0) {
    // Find the best video directly from movieVideos
    const bestVideo = getBestAvailableVideo()
    if (bestVideo) {
      currentVideo.value = bestVideo

      // Initialize YouTube Player with best video
      await initializeYouTubePlayer()
    } else {
      console.warn('❌ No suitable video found')
    }
  } else {
    console.warn('⚠️ No videos loaded yet')
  }
}

// Helper function to get best video directly from movieVideos
const getBestAvailableVideo = (): MovieVideo | null => {
  if (movieVideos.value.length === 0) return null

  // Priority: Official trailers > Any trailers > Clips > Other types
  const priorities = ['Trailer', 'Featurette', 'Clip', 'Teaser', 'Behind the Scenes']

  // First try official videos
  for (const type of priorities) {
    const video = movieVideos.value.find(
      v => v.type === type && v.site === 'YouTube' && v.official === true
    )
    if (video) {
      return video
    }
  }

  // Then try any videos of these types
  for (const type of priorities) {
    const video = movieVideos.value.find(v => v.type === type && v.site === 'YouTube')
    if (video) {
      return video
    }
  }

  // Fallback to any YouTube video
  const fallback = movieVideos.value.find(v => v.site === 'YouTube')
  if (fallback) {
    return fallback
  }

  return null
}

const switchToVideo = async (video: MovieVideo) => {
  if (currentVideo.value?.key === video.key) return

  currentVideo.value = video

  // Re-initialize player with new video
  await initializeYouTubePlayer()
}

const toggleFullWatchMode = () => {
  isFullWatchMode.value = !isFullWatchMode.value
}

// Load YouTube API
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // Create script tag for YouTube API
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)

    // YouTube API ready callback
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

// Netflix-like helper functions
const getVideoThumbnail = (_video: MovieVideo): string => {
  // Use movie poster as thumbnail (YouTube thumbnails require API key)
  return getBackdropUrl(content.value?.backdrop_path ?? content.value?.poster_path ?? null)
}

const getVideoDescription = (video: MovieVideo): string => {
  const descriptions = {
    Trailer: 'Official movie trailer showcasing key scenes and highlights',
    Teaser: "Short preview giving a taste of what's to come",
    Clip: 'Exclusive scene or behind-the-scenes footage',
    Featurette: 'In-depth look at the making of the movie',
    'Behind the Scenes': 'Exclusive behind-the-scenes content',
  }

  return descriptions[video.type as keyof typeof descriptions] || 'Video content from the movie'
}

const getVideoQuality = (video: MovieVideo): string => {
  if (video.size) {
    const qualities = {
      1080: 'Full HD',
      720: 'HD',
      480: 'SD',
      360: 'SD',
      240: 'Low',
    }
    return qualities[video.size as keyof typeof qualities] || 'HD'
  }

  return video.official ? 'HD' : 'SD'
}

// Enhanced video search - also searches for full movies on YouTube

// Initialize YouTube Player
const initializeYouTubePlayer = async () => {
  try {
    playerLoading.value = true

    if (!currentVideo.value || currentVideo.value.site !== 'YouTube') {
      console.warn('❌ No current video or not YouTube:', currentVideo.value)
      throw new Error(`No video available`)
    }

    // Load YouTube API
    await loadYouTubeAPI()

    // Scroll to top when starting video
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Destroy existing player if it exists
    if (youtubePlayer.value && youtubePlayer.value.destroy) {
      youtubePlayer.value.destroy()
      youtubePlayer.value = null
    }

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))

    // Create YouTube Player
    youtubePlayer.value = new window.YT.Player('youtube-player', {
      videoId: currentVideo.value.key,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        showinfo: 0,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        fs: 0,
        cc_load_policy: 0,
        disablekb: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    })
  } catch (error) {
    console.warn('❌ Failed to initialize YouTube player:', error)
    videoError.value = `Failed to load video: ${error}`
  } finally {
    playerLoading.value = false
  }
}

// YouTube Player Events
const onPlayerReady = (event: any) => {
  // Set initial volume
  event.target.setVolume(volume.value)

  // Get video duration
  duration.value = event.target.getDuration()

  // Start update interval
  startPlayerUpdateInterval()
}

const onPlayerStateChange = (event: any) => {
  const state = event.data

  switch (state) {
    case window.YT.PlayerState.PLAYING:
      isPlaying.value = true
      break
    case window.YT.PlayerState.PAUSED:
      isPlaying.value = false
      break
    case window.YT.PlayerState.ENDED:
      isPlaying.value = false
      break
    case window.YT.PlayerState.BUFFERING:
      break
  }
}

const onPlayerError = (event: any) => {
  const errorCodes = {
    2: 'Invalid video ID',
    5: 'HTML5 player error',
    100: 'Video not found or private',
    101: 'Video not available in this country',
    150: 'Video not available in this country',
  }

  const errorMessage =
    errorCodes[event.data as keyof typeof errorCodes] || `Unknown error (${event.data})`
  console.warn('❌ YouTube player error:', {
    code: event.data,
    message: errorMessage,
    videoKey: currentVideo.value?.key,
    videoName: currentVideo.value?.name,
  })

  videoError.value = `Video playback error: ${errorMessage}`
}

// Player Update Interval
const startPlayerUpdateInterval = () => {
  if (playerUpdateInterval.value) {
    clearInterval(playerUpdateInterval.value)
  }

  playerUpdateInterval.value = window.setInterval(() => {
    if (youtubePlayer.value && youtubePlayer.value.getCurrentTime) {
      currentTime.value = youtubePlayer.value.getCurrentTime()
    }
  }, 1000)
}

// Control Methods
const togglePlayPause = () => {
  if (!youtubePlayer.value) return

  if (isPlaying.value) {
    youtubePlayer.value.pauseVideo()
  } else {
    youtubePlayer.value.playVideo()
  }
}

const toggleMute = () => {
  if (!youtubePlayer.value) return

  if (isMuted.value) {
    youtubePlayer.value.unMute()
    youtubePlayer.value.setVolume(volume.value)
  } else {
    youtubePlayer.value.mute()
  }

  isMuted.value = !isMuted.value
}

const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newVolume = parseInt(target.value)

  volume.value = newVolume

  if (youtubePlayer.value) {
    youtubePlayer.value.setVolume(newVolume)

    if (newVolume === 0) {
      isMuted.value = true
    } else if (isMuted.value) {
      isMuted.value = false
    }
  }
}

const seekTo = (event: MouseEvent) => {
  if (!youtubePlayer.value || !progressBar.value) return

  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * duration.value

  youtubePlayer.value.seekTo(newTime, true)
  currentTime.value = newTime
}

// Utility Methods
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

const getCurrentVideoInfo = (): string => {
  if (currentVideo.value) {
    return `${currentVideo.value.type} • YouTube • ${currentVideo.value.name}`
  }
  return 'No video information available'
}

// Similar Content Methods
const setRecommendationType = async (type: 'similar' | 'recommendations') => {
  if (recommendationType.value === type) return

  recommendationType.value = type
  await loadSimilarContent()
}

const loadSimilarContent = async () => {
  if (!content.value) return

  similarLoading.value = true
  similarError.value = null

  try {
    const contentId = Number(props.id)

    let response
    if (contentType.value === 'movie') {
      response =
        recommendationType.value === 'similar'
          ? await getSimilarMovies(contentId)
          : await getMovieRecommendations(contentId)
    } else {
      response =
        recommendationType.value === 'similar'
          ? await getSimilarTVSeries(contentId)
          : await getTVSeriesRecommendations(contentId)
    }

    if (response.success && response.data) {
      similarContent.value = response.data.results.slice(0, 18) // Limit to 18 items
    } else {
      throw new Error(response.error || `Failed to load ${recommendationType.value} content`)
    }
  } catch (error: any) {
    console.warn(`❌ Failed to load ${recommendationType.value} content:`, error.message)
    similarError.value = error.message
  } finally {
    similarLoading.value = false
  }
}

const getSectionTitle = (): string => {
  if (recommendationType.value === 'similar') {
    return `More Like "${getContentTitle(content.value)}"`
  } else {
    return 'Recommended For You'
  }
}

const getContentTitle = (item: any): string => {
  return item?.title || item?.name || 'Untitled'
}

const getContentYear = (item: any): string => {
  const date = item?.release_date || item?.first_air_date
  if (!date) return 'Unknown'
  return new Date(date).getFullYear().toString()
}

const getContentPoster = (posterPath: string | null): string => {
  return getImageUrl(posterPath, 'w300')
}

const watchSimilarContent = (item: Movie | TVSeries) => {
  // Navigate to the new content
  const routeName = contentType.value === 'movie' ? 'watch-movie' : 'watch-series'
  router.push({
    name: routeName,
    params: { id: item.id.toString() },
  })
}

// Get best available video from TMDB API

// Watch for content changes to load videos and then auto-start
watch(
  () => content.value,
  async newContent => {
    if (newContent) {
      // Content is loaded, videos should be loading now
      // startWatching will be called after videos are loaded
    }
  }
)

// Watch for videos being loaded, then auto-start
watch(
  () => movieVideos.value.length,
  async videoCount => {
    if (videoCount > 0 && content.value && !hasStartedWatching.value) {
      await startWatching()
    }
  }
)

// Watch for when user starts watching to load similar content
watch(
  () => hasStartedWatching.value,
  isWatching => {
    if (isWatching && content.value) {
      loadSimilarContent()
    }
  }
)

// Watch for route changes to reload content
watch(
  () => route.params.id,
  async newId => {
    if (newId && newId !== props.id) {
      // Reset player state
      hasStartedWatching.value = false
      isFullWatchMode.value = false
      showMovieInfo.value = false
      currentVideo.value = null
      youtubePlayer.value = null
      currentTime.value = 0
      duration.value = 0

      // Reload content
      await loadContent()
    }
  }
)

// Lifecycle
onMounted(() => {
  loadContent()
})

onUnmounted(() => {
  if (watchTimer.value) {
    clearInterval(watchTimer.value)
  }

  if (playerUpdateInterval.value) {
    clearInterval(playerUpdateInterval.value)
  }

  // Clean up YouTube player
  if (youtubePlayer.value && youtubePlayer.value.destroy) {
    youtubePlayer.value.destroy()
  }
})
</script>

<style scoped>
.watch-view {
  font-family: 'Inter', sans-serif;
}

/* Smooth animations */
.transition-all {
  transition: all 0.3s ease;
}

.transform:hover {
  transform: scale(1.05);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ef4444, #8b5cf6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #dc2626, #7c3aed);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Custom Slider Styles */
.slider {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
}

.slider::-webkit-slider-track {
  background: #374151;
  border-radius: 4px;
  height: 4px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  background: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #dc2626;
}

.slider::-moz-range-track {
  background: #374151;
  border-radius: 4px;
  height: 4px;
  border: none;
}

.slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  background: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.3s ease;
}

.slider::-moz-range-thumb:hover {
  background: #dc2626;
}

/* Control Bar Animation */
.watch-view .bg-gradient-to-t {
  animation: slideUpFade 0.5s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Player Container Hover Effects */
.youtube-player-container:hover .controls-overlay {
  opacity: 1;
  visibility: visible;
}

/* Responsive Controls */
@media (max-width: 768px) {
  .flex.items-center.justify-between {
    flex-direction: column;
    gap: 1rem;
  }

  .flex.items-center.gap-4,
  .flex.items-center.gap-3 {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ml-4 {
    margin-left: 0;
    text-align: center;
  }
}
</style>
