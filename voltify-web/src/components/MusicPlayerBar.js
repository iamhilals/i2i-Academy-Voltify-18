import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Disc, Radio, ListMusic, Upload, Check, Maximize2 } from 'lucide-react';

const INITIAL_TRACKS = [
  {
    id: 'track-1',
    title: "Lo-Fi Green Energy",
    artist: "Voltify Chillout Beats",
    album: "Eco Vibes Vol. 1",
    duration: 372,
    coverColor: "from-green-500 to-emerald-700",
    genre: "Lo-Fi / Chill",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 'track-2',
    title: "Synthwave Grid Efficiency",
    artist: "VoltBot Cyber Synth",
    album: "Future Grid 2026",
    duration: 423,
    coverColor: "from-purple-600 to-indigo-800",
    genre: "Synthwave",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 'track-3',
    title: "Ambient Sunset Solar",
    artist: "Solaris Chill",
    album: "Clean Power Sessions",
    duration: 344,
    coverColor: "from-amber-500 to-orange-600",
    genre: "Ambient Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 'track-4',
    title: "Deep Work Flow",
    artist: "i2i Academy Sound Lab",
    album: "Deep Work Sessions",
    duration: 502,
    coverColor: "from-blue-600 to-cyan-700",
    genre: "Deep Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

const MusicPlayerBar = () => {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(300);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Default: Compact Pill, Expand on Hover
  const [showPlaylist, setShowPlaylist] = useState(false);

  // HTML5 Audio Reference
  const audioRef = useRef(null);

  if (!audioRef.current && typeof window !== 'undefined') {
    audioRef.current = new Audio();
  }

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Setup HTML5 Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setTrackDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      changeTrack('next');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks]);

  // Volume Adjustment Listener
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play / Pause Logic
  const playTrack = (trackToPlay) => {
    const targetTrack = trackToPlay || currentTrack;
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== targetTrack.audioUrl) {
      audio.src = targetTrack.audioUrl;
    }
    
    audio.volume = isMuted ? 0 : volume;
    
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.log("Audio playback error:", err);
      setIsPlaying(false);
    });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack);
    }
  };

  // Select Track Directly from Playlist
  const selectTrack = (index) => {
    pauseTrack();
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setShowPlaylist(false);
    setTimeout(() => {
      playTrack(tracks[index]);
    }, 100);
  };

  // Change Track (Next / Prev)
  const changeTrack = (direction) => {
    pauseTrack();
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    } else {
      nextIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    setTimeout(() => {
      playTrack(tracks[nextIndex]);
    }, 100);
  };

  // Local Custom File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newTrack = {
      id: 'custom-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Yerel Dosya (Local MP3)',
      album: 'Bilgisayarımdan',
      duration: 180,
      coverColor: 'from-pink-600 to-rose-800',
      genre: 'Kullanıcı MP3',
      isCustom: true,
      audioUrl: fileUrl
    };

    const newTracks = [...tracks, newTrack];
    setTracks(newTracks);
    const newIndex = newTracks.length - 1;
    selectTrack(newIndex);
  };

  // Progress Bar Seek / Scrubbing
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPct = clickX / rect.width;
    const dur = (audioRef.current && audioRef.current.duration) || currentTrack.duration || 180;
    const newTime = newPct * dur;

    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDur = (audioRef.current && audioRef.current.duration) || currentTrack.duration || 180;
  const progressPercent = Math.min(100, (currentTime / currentDur) * 100);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPlaylist(false);
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out"
      style={{ width: isHovered ? '92%' : '290px', maxWidth: isHovered ? '56rem' : '290px' }}
    >
      
      {/* Playlist Popover Menu (Only when expanded & toggled) */}
      {isHovered && showPlaylist && (
        <div className="mb-3 bg-gray-900/95 dark:bg-[#182119]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-3 duration-200 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-sm text-white">Müzik Listesi & Şarkı Seçimi</h3>
            </div>
            
            {/* Local File Upload Button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4C811F] hover:bg-green-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>Cihazdan MP3 Yükle</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <div 
                key={track.id} 
                onClick={() => selectTrack(idx)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                  idx === currentTrackIndex ? 'bg-white/15 border border-green-500/30' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${track.coverColor} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {idx === currentTrackIndex && isPlaying ? <Disc className="w-4 h-4 text-white animate-spin" /> : <Music className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${idx === currentTrackIndex ? 'text-green-400' : 'text-white'}`}>{track.title}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{track.artist} • <span className="text-gray-500">{track.genre}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {idx === currentTrackIndex && (
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> Çalıyor
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-mono">{formatTime(track.duration || 180)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPACT DEFAULT VIEW (When NOT hovered) */}
      {!isHovered ? (
        <div className="bg-gray-900/90 dark:bg-[#1E271F]/95 backdrop-blur-xl border border-white/10 text-white rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentTrack.coverColor} flex items-center justify-center shadow-md shrink-0 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <Disc className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white group-hover:text-green-400 transition-colors">{currentTrack.title}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-[#4C811F] hover:bg-green-600 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      ) : (
        /* EXPANDED HOVER VIEW (When hovered) */
        <div className="bg-gray-900/95 dark:bg-[#182119]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.45)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Progress Bar Line at top of bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 cursor-pointer group" onClick={handleSeek}>
            <div 
              className="h-full bg-gradient-to-r from-[#4C811F] to-emerald-400 transition-all duration-200 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* Left: Track Information & Album Art & Playlist Toggle */}
            <div className="flex items-center gap-4 w-full sm:w-1/3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTrack.coverColor} flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group`}>
                <Disc className={`w-6 h-6 text-white transition-transform ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '5s' }} />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
                  <span className="px-2 py-0.5 bg-white/10 text-emerald-300 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
                    {currentTrack.genre}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium truncate">{currentTrack.artist}</p>
              </div>

              {/* Playlist Button */}
              <button 
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-2 rounded-xl border transition-colors ${showPlaylist ? 'bg-green-600/30 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                title="Şarkı Listesi & Seçim"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Player Controls */}
            <div className="flex flex-col items-center gap-1.5 w-full sm:w-1/3">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => changeTrack('prev')} 
                  className="text-gray-400 hover:text-white transition-colors active:scale-95"
                  title="Önceki Şarkı"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button 
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-[#4C811F] hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-900/40 transition-all hover:scale-105 active:scale-95"
                  title={isPlaying ? "Durdur" : "Oynat"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button 
                  onClick={() => changeTrack('next')} 
                  className="text-gray-400 hover:text-white transition-colors active:scale-95"
                  title="Sonraki Şarkı"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Animated Equalizer Wave (when playing) */}
              <div className="flex items-center gap-1 h-3">
                {isPlaying ? (
                  <>
                    <span className="w-1 bg-green-400 rounded-full animate-pulse h-3" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 bg-green-300 rounded-full animate-pulse h-3.5" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-1.5" style={{ animationDelay: '0.4s' }}></span>
                    <span className="w-1 bg-green-400 rounded-full animate-pulse h-3" style={{ animationDelay: '0.15s' }}></span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase flex items-center gap-1">
                    <Radio className="w-3 h-3 text-gray-500" /> Voltify Player
                  </span>
                )}
              </div>
            </div>

            {/* Right: Volume & Time & Upload File */}
            <div className="flex items-center justify-end gap-3 w-full sm:w-1/3">
              <span className="text-xs font-medium text-gray-400 font-mono hidden md:inline">
                {formatTime(currentTime)} / {formatTime(currentDur)}
              </span>

              {/* Upload Button */}
              <label 
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Bilgisayarından MP3/Müzik Yükle"
              >
                <Upload className="w-4 h-4" />
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-16 sm:w-20 accent-[#4C811F] bg-gray-700 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MusicPlayerBar;
