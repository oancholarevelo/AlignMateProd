import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

const { width: screenWidth } = Dimensions.get("window");

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  try {
    const date = new Date(`1970-01-01T${timeString}Z`);
    if (isNaN(date.getTime())) return timeString;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timeString;
  }
};

// Enhanced SVG Icons with animations and better visuals
const THEME_ICONS = {
  pet: {
    egg: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='eggGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFE0E6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FFB6C1;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='50' cy='55' rx='25' ry='35' fill='url(%23eggGrad)' stroke='%23FF69B4' stroke-width='2'/%3E%3Cpath d='M35 45 Q50 35 65 45' stroke='%23FF1493' stroke-width='1.5' fill='none'/%3E%3Cpath d='M30 65 Q50 55 70 65' stroke='%23FF1493' stroke-width='1' fill='none'/%3E%3C/svg%3E",

    baby: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='petGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFE0E6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF69B4;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg%3E%3Ccircle cx='30' cy='30' r='8' fill='url(%23petGrad)'/%3E%3Ccircle cx='70' cy='30' r='8' fill='url(%23petGrad)'/%3E%3Cellipse cx='50' cy='55' rx='20' ry='15' fill='url(%23petGrad)'/%3E%3Ccircle cx='42' cy='48' r='2' fill='%23333'/%3E%3Ccircle cx='58' cy='48' r='2' fill='%23333'/%3E%3Cpath d='M45 55 Q50 60 55 55' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3Cpath d='M50 70 Q55 75 60 70' stroke='%23FF1493' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E",

    adult:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='adultGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF69B4;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF1493;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg%3E%3Ccircle cx='25' cy='25' r='12' fill='url(%23adultGrad)'/%3E%3Ccircle cx='75' cy='25' r='12' fill='url(%23adultGrad)'/%3E%3Cellipse cx='50' cy='50' rx='30' ry='25' fill='url(%23adultGrad)'/%3E%3Cpath d='M35 45 Q50 55 65 45' stroke='%23333' stroke-width='2' fill='none'/%3E%3Ccircle cx='42' cy='40' r='3' fill='%23333'/%3E%3Ccircle cx='58' cy='40' r='3' fill='%23333'/%3E%3Cpath d='M30 70 Q50 80 70 70' stroke='%23FF1493' stroke-width='3' fill='none'/%3E%3C/g%3E%3C/svg%3E",

    legendary:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='legendGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23FF69B4;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF1493;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg%3E%3Ccircle cx='25' cy='25' r='12' fill='url(%23legendGrad)'/%3E%3Ccircle cx='75' cy='25' r='12' fill='url(%23legendGrad)'/%3E%3Cellipse cx='50' cy='50' rx='30' ry='25' fill='url(%23legendGrad)'/%3E%3Cpath d='M35 45 Q50 55 65 45' stroke='%23333' stroke-width='2' fill='none'/%3E%3Ccircle cx='42' cy='40' r='3' fill='%23333'/%3E%3Ccircle cx='58' cy='40' r='3' fill='%23333'/%3E%3Cpath d='M45 15 L50 5 L55 15 L60 10 L58 20 L50 25 L42 20 L40 10 Z' fill='%23FFD700'/%3E%3Cpath d='M30 70 Q50 85 70 70' stroke='%23FFD700' stroke-width='3' fill='none'/%3E%3C/g%3E%3C/svg%3E",
  },

  city: {
    house:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='houseGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236B8E23;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M20 60 L50 30 L80 60 L80 85 L20 85 Z' fill='url(%23houseGrad)'/%3E%3Crect x='40' y='65' width='20' height='20' fill='%23654321'/%3E%3Crect x='25' y='55' width='12' height='12' fill='%23FFD700'/%3E%3Crect x='63' y='55' width='12' height='12' fill='%23FFD700'/%3E%3Cpath d='M15 60 L50 25 L85 60' stroke='%23654321' stroke-width='3' fill='none'/%3E%3C/svg%3E",

    neighborhood:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='neighGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236B8E23;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='5' y='50' width='15' height='35' fill='url(%23neighGrad)'/%3E%3Crect x='25' y='45' width='15' height='40' fill='url(%23neighGrad)'/%3E%3Crect x='45' y='40' width='15' height='45' fill='url(%23neighGrad)'/%3E%3Crect x='65' y='35' width='15' height='50' fill='url(%23neighGrad)'/%3E%3Crect x='85' y='55' width='10' height='30' fill='url(%23neighGrad)'/%3E%3Cg fill='%23FFD700'%3E%3Crect x='7' y='55' width='3' height='3'/%3E%3Crect x='27' y='50' width='3' height='3'/%3E%3Crect x='47' y='45' width='3' height='3'/%3E%3Crect x='67' y='40' width='3' height='3'/%3E%3C/g%3E%3C/svg%3E",

    megacity:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='megaGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%236B8E23;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23megaGrad)'%3E%3Crect x='5' y='20' width='8' height='65'/%3E%3Crect x='18' y='10' width='8' height='75'/%3E%3Crect x='31' y='25' width='8' height='60'/%3E%3Crect x='44' y='5' width='8' height='80'/%3E%3Crect x='57' y='15' width='8' height='70'/%3E%3Crect x='70' y='30' width='8' height='55'/%3E%3Crect x='83' y='25' width='8' height='60'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M48 0 L52 8 L48 5 Z'/%3E%3Ccircle cx='7' cy='25' r='1'/%3E%3Ccircle cx='22' cy='15' r='1'/%3E%3Ccircle cx='48' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E",
  },

  fitness: {
    novice:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='noviceGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFE0B2;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF9800;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23noviceGrad)'%3E%3Ccircle cx='50' cy='20' r='12'/%3E%3Crect x='42' y='30' width='16' height='35' rx='8'/%3E%3Ccircle cx='35' cy='40' r='6'/%3E%3Ccircle cx='65' cy='40' r='6'/%3E%3Crect x='45' y='65' width='5' height='20'/%3E%3Crect x='50' y='65' width='5' height='20'/%3E%3C/g%3E%3Cg fill='%23FF6F00'%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='55' cy='15' r='2'/%3E%3Cpath d='M47 20 Q50 23 53 20' stroke='%23FF6F00' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/svg%3E",

    knight:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='knightGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF9800;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF5722;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23knightGrad)'%3E%3Ccircle cx='50' cy='20' r='12'/%3E%3Crect x='42' y='30' width='16' height='35' rx='8'/%3E%3Ccircle cx='35' cy='40' r='6'/%3E%3Ccircle cx='65' cy='40' r='6'/%3E%3Crect x='45' y='65' width='5' height='20'/%3E%3Crect x='50' y='65' width='5' height='20'/%3E%3C/g%3E%3Cg fill='%23C62828'%3E%3Crect x='45' y='10' width='10' height='6' rx='3'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='55' cy='15' r='2'/%3E%3Cpath d='M47 20 Q50 23 53 20' stroke='%23C62828' stroke-width='1' fill='none'/%3E%3Crect x='40' y='35' width='20' height='8' rx='4' fill='%23FFD700'/%3E%3C/g%3E%3C/svg%3E",

    champion:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='champGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF9800;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23champGrad)'%3E%3Ccircle cx='50' cy='20' r='12'/%3E%3Crect x='42' y='30' width='16' height='35' rx='8'/%3E%3Ccircle cx='35' cy='40' r='6'/%3E%3Ccircle cx='65' cy='40' r='6'/%3E%3Crect x='45' y='65' width='5' height='20'/%3E%3Crect x='50' y='65' width='5' height='20'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M45 5 L50 0 L55 5 L52 10 L48 10 Z'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='55' cy='15' r='2'/%3E%3Cpath d='M47 20 Q50 23 53 20' stroke='%23FFD700' stroke-width='1' fill='none'/%3E%3Crect x='40' y='35' width='20' height='8' rx='4'/%3E%3Cpath d='M25 45 L35 50 L25 55 L30 50 Z'/%3E%3Cpath d='M75 45 L65 50 L75 55 L70 50 Z'/%3E%3C/g%3E%3C/svg%3E",

    legendary:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='legendaryGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23FF9800;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF5722;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23legendaryGrad)'%3E%3Ccircle cx='50' cy='20' r='15'/%3E%3Crect x='40' y='30' width='20' height='40' rx='10'/%3E%3Ccircle cx='30' cy='40' r='8'/%3E%3Ccircle cx='70' cy='40' r='8'/%3E%3Crect x='43' y='70' width='6' height='20'/%3E%3Crect x='51' y='70' width='6' height='20'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M40 0 L50 8 L60 0 L55 10 L50 5 L45 10 Z'/%3E%3Ccircle cx='44' cy='15' r='2'/%3E%3Ccircle cx='56' cy='15' r='2'/%3E%3Cpath d='M46 22 Q50 26 54 22' stroke='%23FFD700' stroke-width='2' fill='none'/%3E%3Crect x='35' y='35' width='30' height='10' rx='5'/%3E%3Cpath d='M20 40 L30 45 L20 50 L25 45 Z'/%3E%3Cpath d='M80 40 L70 45 L80 50 L75 45 Z'/%3E%3Cg stroke='%23FFD700' stroke-width='2' fill='none'%3E%3Cpath d='M25 25 Q30 20 35 25'/%3E%3Cpath d='M75 25 Q70 20 65 25'/%3E%3Cpath d='M50 85 Q45 90 40 85'/%3E%3Cpath d='M50 85 Q55 90 60 85'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
  },

  space: {
    rocket:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='rocketGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E1F5FE;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%233F51B5;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23rocketGrad)'%3E%3Cpath d='M50 10 L58 30 L50 35 L42 30 Z'/%3E%3Cellipse cx='50' cy='45' rx='12' ry='18'/%3E%3Cpath d='M38 63 Q50 73 62 63 L58 78 L54 83 L50 88 L46 83 L42 78 Z'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M30 70 L25 80 L35 75 Z'/%3E%3Cpath d='M70 70 L75 80 L65 75 Z'/%3E%3C/g%3E%3Cg fill='%23FF5722'%3E%3Cpath d='M46 88 L50 93 L54 88 L50 83 Z'/%3E%3C/g%3E%3Cg fill='%2342A5F5'%3E%3Ccircle cx='50' cy='40' r='4'/%3E%3Crect x='48' y='50' width='4' height='8' rx='2'/%3E%3C/g%3E%3C/svg%3E",

    shuttle:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='shuttleGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E1F5FE;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%233F51B5;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23shuttleGrad)'%3E%3Cpath d='M50 5 L62 25 L58 30 L50 35 L42 30 L38 25 Z'/%3E%3Cellipse cx='50' cy='45' rx='18' ry='22'/%3E%3Cpath d='M32 67 Q50 80 68 67 L64 82 L58 87 L50 92 L42 87 L36 82 Z'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M25 65 L20 78 L32 72 Z'/%3E%3Cpath d='M75 65 L80 78 L68 72 Z'/%3E%3Cpath d='M15 60 L10 70 L22 67 Z'/%3E%3Cpath d='M85 60 L90 70 L78 67 Z'/%3E%3C/g%3E%3Cg fill='%23FF5722'%3E%3Cpath d='M42 92 L50 98 L58 92 L50 87 Z'/%3E%3C/g%3E%3Cg fill='%2342A5F5'%3E%3Ccircle cx='50' cy='35' r='6'/%3E%3Crect x='40' y='50' width='20' height='12' rx='6'/%3E%3Ccircle cx='45' cy='40' r='2'/%3E%3Ccircle cx='55' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E",

    station:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='stationGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E1F5FE;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%233F51B5;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23stationGrad)'%3E%3Ccircle cx='50' cy='50' r='25'/%3E%3Crect x='20' y='45' width='60' height='10' rx='5'/%3E%3Crect x='45' y='20' width='10' height='60' rx='5'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Ccircle cx='50' cy='30' r='4'/%3E%3Ccircle cx='50' cy='70' r='4'/%3E%3Ccircle cx='30' cy='50' r='4'/%3E%3Ccircle cx='70' cy='50' r='4'/%3E%3Ccircle cx='35' cy='35' r='3'/%3E%3Ccircle cx='65' cy='35' r='3'/%3E%3Ccircle cx='35' cy='65' r='3'/%3E%3Ccircle cx='65' cy='65' r='3'/%3E%3C/g%3E%3Cg fill='%2342A5F5'%3E%3Ccircle cx='50' cy='50' r='8'/%3E%3Crect x='46' y='35' width='8' height='6' rx='3'/%3E%3Crect x='46' y='59' width='8' height='6' rx='3'/%3E%3C/g%3E%3Cg stroke='%23FFD700' stroke-width='2' fill='none'%3E%3Cpath d='M10 30 Q15 25 20 30'/%3E%3Cpath d='M90 30 Q85 25 80 30'/%3E%3Cpath d='M10 70 Q15 75 20 70'/%3E%3Cpath d='M90 70 Q85 75 80 70'/%3E%3C/g%3E%3C/svg%3E",

    mothership:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='mothershipGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%233F51B5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231A237E;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23mothershipGrad)'%3E%3Cellipse cx='50' cy='40' rx='40' ry='15'/%3E%3Cellipse cx='50' cy='55' rx='30' ry='10'/%3E%3Cellipse cx='50' cy='65' rx='20' ry='8'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Ccircle cx='30' cy='35' r='3'/%3E%3Ccircle cx='50' cy='30' r='4'/%3E%3Ccircle cx='70' cy='35' r='3'/%3E%3Ccircle cx='40' cy='45' r='2'/%3E%3Ccircle cx='60' cy='45' r='2'/%3E%3Ccircle cx='50' cy='55' r='3'/%3E%3C/g%3E%3Cg fill='%2342A5F5'%3E%3Ccircle cx='50' cy='40' r='6'/%3E%3Crect x='35' y='48' width='30' height='8' rx='4'/%3E%3C/g%3E%3Cg stroke='%23FFD700' stroke-width='3' fill='none'%3E%3Cpath d='M15 40 Q10 35 5 40'/%3E%3Cpath d='M85 40 Q90 35 95 40'/%3E%3Cpath d='M20 50 Q15 55 10 50'/%3E%3Cpath d='M80 50 Q85 55 90 50'/%3E%3C/g%3E%3Cg fill='%23FF5722'%3E%3Cpath d='M30 70 L25 80 L35 75 Z'/%3E%3Cpath d='M50 75 L45 85 L55 80 Z'/%3E%3Cpath d='M70 70 L75 80 L65 75 Z'/%3E%3C/g%3E%3C/svg%3E",
  },

  trees: {
    seedling:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='seedlingGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23C8E6C9;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23seedlingGrad)'%3E%3Cpath d='M50 65 Q45 50 35 45 Q40 40 50 45 Q55 35 65 40 Q60 50 50 45 L50 65'/%3E%3C/g%3E%3Crect x='47' y='65' width='6' height='20' fill='%238D6E63'/%3E%3Cg fill='%2366BB6A'%3E%3Cpath d='M40 50 Q35 45 30 50'/%3E%3Cpath d='M60 50 Q65 45 70 50'/%3E%3C/g%3E%3Cellipse cx='50' cy='85' rx='15' ry='5' fill='%236D4C41'/%3E%3C/svg%3E",

    sapling:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='saplingGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23C8E6C9;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23saplingGrad)'%3E%3Ccircle cx='40' cy='30' r='12'/%3E%3Ccircle cx='60' cy='35' r='10'/%3E%3Ccircle cx='50' cy='45' r='14'/%3E%3C/g%3E%3Crect x='47' y='55' width='6' height='30' fill='%238D6E63'/%3E%3Cg fill='%2366BB6A'%3E%3Cpath d='M30 35 Q25 30 20 35'/%3E%3Cpath d='M70 40 Q75 35 80 40'/%3E%3Cpath d='M25 50 Q20 45 15 50'/%3E%3C/g%3E%3Cellipse cx='50' cy='85' rx='20' ry='6' fill='%236D4C41'/%3E%3C/svg%3E",

    tree: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='treeGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23388E3C;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23treeGrad)'%3E%3Ccircle cx='50' cy='25' r='18'/%3E%3Ccircle cx='30' cy='40' r='14'/%3E%3Ccircle cx='70' cy='40' r='14'/%3E%3Ccircle cx='50' cy='50' r='16'/%3E%3C/g%3E%3Crect x='45' y='60' width='10' height='25' fill='%238D6E63'/%3E%3Cg fill='%2366BB6A'%3E%3Cpath d='M20 30 Q15 25 10 30'/%3E%3Cpath d='M80 30 Q85 25 90 30'/%3E%3Cpath d='M15 50 Q10 45 5 50'/%3E%3Cpath d='M85 50 Q90 45 95 50'/%3E%3C/g%3E%3Cellipse cx='50' cy='85' rx='25' ry='8' fill='%236D4C41'/%3E%3C/svg%3E",

    forest:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='forestGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%232E7D32;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23forestGrad)'%3E%3Ccircle cx='25' cy='20' r='15'/%3E%3Ccircle cx='50' cy='15' r='18'/%3E%3Ccircle cx='75' cy='25' r='12'/%3E%3Ccircle cx='15' cy='40' r='12'/%3E%3Ccircle cx='35' cy='45' r='14'/%3E%3Ccircle cx='65' cy='40' r='16'/%3E%3Ccircle cx='85' cy='45' r='10'/%3E%3Ccircle cx='50' cy='55' r='20'/%3E%3C/g%3E%3Cg fill='%238D6E63'%3E%3Crect x='22' y='35' width='6' height='20'/%3E%3Crect x='47' y='30' width='6' height='25'/%3E%3Crect x='72' y='40' width='6' height='15'/%3E%3Crect x='32' y='55' width='6' height='15'/%3E%3Crect x='62' y='50' width='6' height='20'/%3E%3C/g%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M5 25 Q8 20 12 25'/%3E%3Cpath d='M88 30 Q92 25 95 30'/%3E%3Cpath d='M10 45 Q5 40 0 45'/%3E%3Cpath d='M95 50 Q98 45 100 50'/%3E%3C/g%3E%3Cellipse cx='50' cy='75' rx='40' ry='10' fill='%236D4C41'/%3E%3C/svg%3E",
  },
};

// Animated Achievement Display Component
const AnimatedAchievement = ({ theme, rewardCount, isVisible }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Gentle rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [isVisible, scaleAnim, rotateAnim, pulseAnim]);

  const getAchievementIcon = () => {
    if (theme === "pet") {
      if (rewardCount >= 20) return THEME_ICONS.pet.legendary;
      if (rewardCount >= 10) return THEME_ICONS.pet.adult;
      if (rewardCount >= 3) return THEME_ICONS.pet.baby;
      return THEME_ICONS.pet.egg;
    }
    if (theme === "city") {
      if (rewardCount >= 15) return THEME_ICONS.city.megacity;
      if (rewardCount >= 6) return THEME_ICONS.city.neighborhood;
      return THEME_ICONS.city.house;
    }
    if (theme === "fitness") {
      if (rewardCount >= 15) return THEME_ICONS.fitness.legendary;
      if (rewardCount >= 10) return THEME_ICONS.fitness.champion;
      if (rewardCount >= 6) return THEME_ICONS.fitness.knight;
      return THEME_ICONS.fitness.novice;
    }
    if (theme === "space") {
      if (rewardCount >= 15) return THEME_ICONS.space.mothership;
      if (rewardCount >= 10) return THEME_ICONS.space.station;
      if (rewardCount >= 6) return THEME_ICONS.space.shuttle;
      return THEME_ICONS.space.rocket;
    }
    if (theme === "trees") {
      if (rewardCount >= 15) return THEME_ICONS.trees.forest;
      if (rewardCount >= 10) return THEME_ICONS.trees.tree;
      if (rewardCount >= 6) return THEME_ICONS.trees.sapling;
      return THEME_ICONS.trees.seedling;
    }
    return THEME_ICONS[theme]?.[0] || THEME_ICONS.pet.egg;
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.animatedAchievementContainer}>
      <Animated.View
        style={[
          styles.achievementIconContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: rotate },
            ],
          },
        ]}
      >
        <Image
          source={{ uri: getAchievementIcon() }}
          style={styles.largeAchievementIcon}
        />
      </Animated.View>

      {/* Floating particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
};

// Floating Particle Component
const FloatingParticle = ({ delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(floatAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(opacityAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(opacityAnim, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    startAnimation();
  }, [delay, floatAnim, opacityAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const translateX = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, Math.random() * 20 - 10, Math.random() * 30 - 15],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

// Progress Visualization Component
const ProgressVisualization = ({
  currentReward,
  nextReward,
  progress,
  rate,
  themeColor,
  currentCount,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate actual progress toward next achievement
    const nextTarget = nextReward ? nextReward.at : 0;
    const currentTarget = currentReward ? currentReward.at : 0;
    const actualProgress =
      nextTarget > 0
        ? (currentCount - currentTarget) / (nextTarget - currentTarget)
        : 0;

    Animated.timing(progressAnim, {
      toValue: Math.max(0, Math.min(1, actualProgress)),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, rate, progressAnim, currentReward, nextReward, currentCount]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressVisualizationContainer}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: themeColor, width: animatedWidth },
          ]}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressStart}>
            {currentReward?.reward || "Start"}
          </Text>
          <Text style={styles.progressEnd}>
            {nextReward?.reward || "Max Level"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Enhanced Gamification Themes Configuration
const GAMIFICATION_THEMES = {
  pet: {
    name: "Pet Care",
    unit: "Happiness Level",
    description: "Care for your virtual pet!",
    icon: THEME_ICONS.pet.egg,
    color: "#FF6B8A",
    rewards: [
      {
        at: 1,
        reward: "Pet Egg",
        description: "Your first companion!",
        icon: THEME_ICONS.pet.egg,
      },
      {
        at: 3,
        reward: "Baby Pet",
        description: "Your pet hatched!",
        icon: THEME_ICONS.pet.baby,
      },
      {
        at: 6,
        reward: "Adult Pet",
        description: "Fully grown companion!",
        icon: THEME_ICONS.pet.adult,
      },
      {
        at: 10,
        reward: "Happy Pet",
        description: "Joyful companion!",
        icon: THEME_ICONS.pet.adult,
      },
      {
        at: 15,
        reward: "Legendary Pet",
        description: "Mythical evolution!",
        icon: THEME_ICONS.pet.legendary,
      },
      {
        at: 20,
        reward: "Pet Master",
        description: "Ultimate pet trainer!",
        icon: THEME_ICONS.pet.legendary,
      },
    ],
  },

  city: {
    name: "City Builder",
    unit: "Buildings Built",
    description: "Build your dream city!",
    icon: THEME_ICONS.city.house,
    color: "#4CAF50",
    rewards: [
      {
        at: 1,
        reward: "First House",
        description: "Welcome home!",
        icon: THEME_ICONS.city.house,
      },
      {
        at: 3,
        reward: "Neighborhood",
        description: "Community growing!",
        icon: THEME_ICONS.city.neighborhood,
      },
      {
        at: 6,
        reward: "Shopping District",
        description: "Commerce thrives!",
        icon: THEME_ICONS.city.neighborhood,
      },
      {
        at: 10,
        reward: "Business Center",
        description: "Economic hub!",
        icon: THEME_ICONS.city.megacity,
      },
      {
        at: 15,
        reward: "Bustling City",
        description: "Metropolitan area!",
        icon: THEME_ICONS.city.megacity,
      },
      {
        at: 20,
        reward: "Megacity",
        description: "Urban masterpiece!",
        icon: THEME_ICONS.city.megacity,
      },
    ],
  },

  fitness: {
    name: "Posture Warrior",
    unit: "Strength Points",
    description: "Become a posture champion!",
    icon: THEME_ICONS.fitness.novice,
    color: "#FF9800",
    rewards: [
      {
        at: 1,
        reward: "Novice Warrior",
        description: "Your journey begins!",
        icon: THEME_ICONS.fitness.novice,
      },
      {
        at: 3,
        reward: "Skilled Fighter",
        description: "Gaining experience!",
        icon: THEME_ICONS.fitness.novice,
      },
      {
        at: 6,
        reward: "Posture Knight",
        description: "Noble protector!",
        icon: THEME_ICONS.fitness.knight,
      },
      {
        at: 10,
        reward: "Posture Champion",
        description: "Elite fighter!",
        icon: THEME_ICONS.fitness.champion,
      },
      {
        at: 15,
        reward: "Posture Master",
        description: "Supreme warrior!",
        icon: THEME_ICONS.fitness.legendary,
      },
      {
        at: 20,
        reward: "Legendary Hero",
        description: "Living legend!",
        icon: THEME_ICONS.fitness.legendary,
      },
    ],
  },

  space: {
    name: "Space Explorer",
    unit: "Planets Discovered",
    description: "Explore the universe!",
    icon: THEME_ICONS.space.rocket,
    color: "#3F51B5",
    rewards: [
      {
        at: 1,
        reward: "First Launch",
        description: "Blast off!",
        icon: THEME_ICONS.space.rocket,
      },
      {
        at: 3,
        reward: "Moon Landing",
        description: "One small step!",
        icon: THEME_ICONS.space.rocket,
      },
      {
        at: 6,
        reward: "Mars Colony",
        description: "Red planet conquered!",
        icon: THEME_ICONS.space.shuttle,
      },
      {
        at: 10,
        reward: "Space Station",
        description: "Orbital outpost!",
        icon: THEME_ICONS.space.station,
      },
      {
        at: 15,
        reward: "Galaxy Explorer",
        description: "Beyond our system!",
        icon: THEME_ICONS.space.mothership,
      },
      {
        at: 20,
        reward: "Universe Master",
        description: "Cosmic champion!",
        icon: THEME_ICONS.space.mothership,
      },
    ],
  },

  trees: {
    name: "Eco Warrior",
    unit: "Trees Planted",
    description: "Save the environment!",
    icon: THEME_ICONS.trees.seedling,
    color: "#4CAF50",
    rewards: [
      {
        at: 1,
        reward: "First Seedling",
        description: "Growth begins!",
        icon: THEME_ICONS.trees.seedling,
      },
      {
        at: 3,
        reward: "Small Grove",
        description: "Forest forming!",
        icon: THEME_ICONS.trees.seedling,
      },
      {
        at: 6,
        reward: "Young Tree",
        description: "Growing strong!",
        icon: THEME_ICONS.trees.sapling,
      },
      {
        at: 10,
        reward: "Forest Guardian",
        description: "Nature's protector!",
        icon: THEME_ICONS.trees.tree,
      },
      {
        at: 15,
        reward: "Amazon Guardian",
        description: "Rainforest protector!",
        icon: THEME_ICONS.trees.forest,
      },
      {
        at: 20,
        reward: "Planet Saver",
        description: "Earth's champion!",
        icon: THEME_ICONS.trees.forest,
      },
    ],
  },
};

const Achievements = ({
  onBack,
  achievementsData: parentAchievementsData,
  userUID: parentUserUID,
}) => {
  const [achievementsData, setAchievementsData] = useState({
    points: 0,
    themeRewards: 0,
    history: [],
    streaks: {
      current: 0,
      longest: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("pet");

  // Use userUID from parent or fallback to localStorage
  const userUID = parentUserUID || localStorage.getItem("userUID");

  // Point display configuration - Adjusted for 20-minute sessions
  const POINT_DISPLAY_CONFIG = {
    pointsPerDisplayPoint: 18,
    pointUnit: "minute",
    pointUnitPlural: "minutes",
    maxSessionPoints: 20,
  };

  // Theme-specific reward rates - Adjusted for 20-minute max
  const THEME_REWARD_RATES = {
    pet: 1,
    city: 1,
    fitness: 1,
    space: 1,
    trees: 1,
  };

  // Helper functions
  const convertToDisplayPoints = (rawPoints) => {
    const displayPoints = Math.floor(
      (rawPoints || 0) / POINT_DISPLAY_CONFIG.pointsPerDisplayPoint
    );
    return Math.min(displayPoints, POINT_DISPLAY_CONFIG.maxSessionPoints);
  };

  const calculateThemeRewards = (displayPoints) => {
    const rate = THEME_REWARD_RATES[selectedTheme] || 1;
    return Math.floor(displayPoints / rate);
  };

  const getThemeProgress = (displayPoints) => {
    const rate = THEME_REWARD_RATES[selectedTheme] || 1;
    return displayPoints % rate;
  };

  const getCurrentReward = (rewardCount) => {
    const theme = GAMIFICATION_THEMES[selectedTheme];
    const sortedRewards = [...theme.rewards].sort((a, b) => a.at - b.at);

    for (let i = sortedRewards.length - 1; i >= 0; i--) {
      if (rewardCount >= sortedRewards[i].at) {
        return sortedRewards[i];
      }
    }
    return null;
  };

  const getNextReward = (rewardCount) => {
    const theme = GAMIFICATION_THEMES[selectedTheme];
    const sortedRewards = [...theme.rewards].sort((a, b) => a.at - b.at);

    for (let reward of sortedRewards) {
      if (rewardCount < reward.at) {
        return reward;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!userUID) return;

    console.log("Achievements component mounted");

    if (parentAchievementsData) {
      const rawPoints = parentAchievementsData.points || 0;
      const displayPoints = convertToDisplayPoints(rawPoints);

      setAchievementsData({
        points: displayPoints,
        themeRewards: calculateThemeRewards(displayPoints),
        history: parentAchievementsData.history || [],
        streaks: {
          current: convertToDisplayPoints(
            parentAchievementsData.streaks?.current || 0
          ),
          longest: convertToDisplayPoints(
            parentAchievementsData.streaks?.longest || 0
          ),
        },
      });
      setLoading(false);
    } else {
      const achievementsRef = ref(database, `users/${userUID}/achievements`);
      const unsubscribe = onValue(achievementsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const rawPoints = data.points || 0;
          const displayPoints = convertToDisplayPoints(rawPoints);

          setAchievementsData({
            points: displayPoints,
            themeRewards: calculateThemeRewards(displayPoints),
            history: data.history || [],
            streaks: {
              current: convertToDisplayPoints(data.streaks?.current || 0),
              longest: convertToDisplayPoints(data.streaks?.longest || 0),
            },
          });
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }

    const sensorStatusRef = ref(database, `users/${userUID}/sensorStatus`);
    const sensorUnsubscribe = onValue(sensorStatusRef, (snapshot) => {
      const status = snapshot.val();
      setSensorConnected(status?.connected === true);
    });

    return () => {
      sensorUnsubscribe();
    };
  }, [userUID, parentAchievementsData]);

  // Update when parent data or theme changes
  useEffect(() => {
    if (parentAchievementsData) {
      const rawPoints = parentAchievementsData.points || 0;
      const displayPoints = convertToDisplayPoints(rawPoints);

      setAchievementsData({
        points: displayPoints,
        themeRewards: calculateThemeRewards(displayPoints),
        history: parentAchievementsData.history || [],
        streaks: {
          current: convertToDisplayPoints(
            parentAchievementsData.streaks?.current || 0
          ),
          longest: convertToDisplayPoints(
            parentAchievementsData.streaks?.longest || 0
          ),
        },
      });
    }
  }, [parentAchievementsData, selectedTheme]);

  // Enhanced Current Status Component
  const CurrentStatus = () => {
    const currentTheme = GAMIFICATION_THEMES[selectedTheme];
    const currentReward = getCurrentReward(achievementsData.themeRewards);
    const nextReward = getNextReward(achievementsData.themeRewards);
    const progress = getThemeProgress(achievementsData.points);
    const rate = THEME_REWARD_RATES[selectedTheme];

    // Calculate remaining minutes to next achievement
    const remainingMinutes = nextReward
      ? nextReward.at - achievementsData.themeRewards
      : 0;

    return (
      <View
        style={[
          styles.statusContainer,
          { backgroundColor: currentTheme.color + "15" },
        ]}
      >
        <View style={styles.statusHeader}>
          <Text style={[styles.statusTitle, { color: currentTheme.color }]}>
            {currentTheme.name}
          </Text>
          <Text style={styles.statusSubtitle}>
            {achievementsData.themeRewards} {currentTheme.unit}
          </Text>
        </View>

        {/* Large Animated Achievement Display */}
        <AnimatedAchievement
          theme={selectedTheme}
          rewardCount={achievementsData.themeRewards}
          isVisible={true}
        />

        {/* Current Achievement */}
        {currentReward && (
          <View
            style={[
              styles.currentAchievementBanner,
              { backgroundColor: currentTheme.color },
            ]}
          >
            <Text style={styles.currentAchievementTitle}>
              🎉 {currentReward.reward}
            </Text>
            <Text style={styles.currentAchievementDesc}>
              {currentReward.description}
            </Text>
          </View>
        )}

        {/* Progress to Next Achievement */}
        {nextReward && (
          <View style={styles.nextAchievementContainer}>
            <Text style={styles.nextAchievementTitle}>
              Next Goal: {nextReward.reward}
            </Text>
            <ProgressVisualization
              currentReward={currentReward}
              nextReward={nextReward}
              progress={progress}
              rate={rate}
              themeColor={currentTheme.color}
              currentCount={achievementsData.themeRewards}
            />
            <Text style={styles.progressText}>
              {remainingMinutes} {remainingMinutes === 1 ? "minute" : "minutes"}{" "}
              to next achievement
            </Text>
          </View>
        )}

        {achievementsData.points === 20 && (
          <View
            style={[
              styles.perfectSessionBanner,
              { borderColor: currentTheme.color },
            ]}
          >
            <Text style={styles.perfectSessionTitle}>
              ⭐ Perfect Session! ⭐
            </Text>
            <Text style={styles.perfectSessionDesc}>
              Maximum points achieved! You're a posture champion!
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Theme Selector Component
  const ThemeSelector = () => {
    const scrollViewRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const cardWidth = 120 + 12; // card width + marginRight
    const totalThemes = Object.keys(GAMIFICATION_THEMES).length;

    // Arrow icons
    const leftArrowIcon =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 100 100'%3E%3Cpath d='M60 20 L30 50 L60 80' stroke='%23666' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
    const rightArrowIcon =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 100 100'%3E%3Cpath d='M40 20 L70 50 L40 80' stroke='%23666' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

    const scrollLeft = () => {
      const newPosition = Math.max(0, scrollPosition - cardWidth);
      scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const scrollRight = () => {
      const maxScroll = Math.max(0, (totalThemes - 2) * cardWidth); // Show 2 cards at a time
      const newPosition = Math.min(maxScroll, scrollPosition + cardWidth);
      scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const handleScroll = (event) => {
      const newScrollPosition = event.nativeEvent.contentOffset.x;
      setScrollPosition(newScrollPosition);
    };

    // Effect to scroll to selected theme when theme changes
    useEffect(() => {
      const themeKeys = Object.keys(GAMIFICATION_THEMES);
      const selectedIndex = themeKeys.indexOf(selectedTheme);

      if (selectedIndex !== -1 && scrollViewRef.current) {
        // Calculate the position to center the selected theme
        const targetPosition = Math.max(
          0,
          Math.min(
            selectedIndex * cardWidth - cardWidth / 2, // Try to center
            (totalThemes - 2) * cardWidth // Don't scroll past the max
          )
        );

        scrollViewRef.current.scrollTo({ x: targetPosition, animated: true });
        setScrollPosition(targetPosition);
      }
    }, [selectedTheme]);

    return (
      <View style={styles.themeSelectorContainer}>
        <Text style={styles.themeSelectorTitle}>Choose Your Adventure:</Text>
        <View style={styles.themeSelectorWrapper}>
          <TouchableOpacity
            style={[
              styles.leftArrowButton,
              scrollPosition <= 10 && styles.arrowDisabled, // Small threshold for better UX
            ]}
            onPress={scrollLeft}
            activeOpacity={0.7}
            disabled={scrollPosition <= 10}
          >
            <Image
              source={{ uri: leftArrowIcon }}
              style={[
                styles.arrowIcon,
                scrollPosition <= 10 && styles.arrowIconDisabled,
              ]}
            />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeScrollView}
            contentContainerStyle={styles.themeScrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
            decelerationRate="fast"
          >
            {Object.entries(GAMIFICATION_THEMES).map(([key, theme]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  selectedTheme === key && [
                    styles.themeCardSelected,
                    { borderColor: theme.color },
                  ],
                ]}
                onPress={() => setSelectedTheme(key)}
              >
                <Image source={{ uri: theme.icon }} style={styles.themeIcon} />
                <Text style={styles.themeCardTitle}>{theme.name}</Text>
                <Text style={styles.themeCardDesc}>{theme.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.rightArrowButton,
              scrollPosition >=
                Math.max(0, (totalThemes - 2) * cardWidth - 10) &&
                styles.arrowDisabled,
            ]}
            onPress={scrollRight}
            activeOpacity={0.7}
            disabled={
              scrollPosition >= Math.max(0, (totalThemes - 2) * cardWidth - 10)
            }
          >
            <Image
              source={{ uri: rightArrowIcon }}
              style={[
                styles.arrowIcon,
                scrollPosition >=
                  Math.max(0, (totalThemes - 2) * cardWidth - 10) &&
                  styles.arrowIconDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Scroll indicator dots */}
        <View style={styles.scrollIndicator}>
          {Object.keys(GAMIFICATION_THEMES).map((themeKey, index) => {
            const isActive = selectedTheme === themeKey;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicatorDot,
                  isActive && styles.indicatorDotActive,
                ]}
                onPress={() => setSelectedTheme(themeKey)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // SVG Icons for other components
  const trophyIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M30 20 L70 20 L70 45 Q70 60 50 60 Q30 60 30 45 Z'/%3E%3Cpath d='M25 25 Q20 25 20 35 Q20 45 25 45 L30 45 L30 35 Z'/%3E%3Cpath d='M75 25 Q80 25 80 35 Q80 45 75 45 L70 45 L70 35 Z'/%3E%3Crect x='45' y='60' width='10' height='15'/%3E%3Crect x='35' y='75' width='30' height='5'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23FFF'/%3E%3C/g%3E%3C/svg%3E";

  const fireIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Cg%3E%3Cpath d='M50 10 Q40 30 45 50 Q35 45 30 60 Q25 75 40 85 Q55 90 70 85 Q85 75 80 60 Q75 45 65 50 Q70 30 60 10 Q55 20 50 10' fill='%23FF4500'/%3E%3Cpath d='M50 20 Q45 35 48 50 Q42 47 38 57 Q35 67 45 75 Q55 78 65 75 Q75 67 72 57 Q68 47 62 50 Q65 35 60 20 Q55 25 50 20' fill='%23FF6B00'/%3E%3Cpath d='M50 30 Q47 40 49 50 Q46 48 44 54 Q42 60 48 65 Q52 67 56 65 Q62 60 60 54 Q58 48 55 50 Q57 40 54 30 Q52 32 50 30' fill='%23FFD700'/%3E%3C/g%3E%3C/svg%3E";
    
  const checkIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 100 100'%3E%3Cpath d='M20 50 L40 70 L80 20' stroke='%234CAF50' stroke-width='12' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading Achievements...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Achievements</Text>
      </View>

      {/* Enhanced Current Status */}
      <CurrentStatus />

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Points Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.pointsCard}>
          <Image source={{ uri: trophyIcon }} style={styles.cardIcon} />
          <Text style={styles.pointsTitle}>Session Minutes</Text>
          <Text style={styles.pointsValue}>{achievementsData.points}/20</Text>
          <Text style={styles.pointsDescription}>
            Perfect posture time in your current session
          </Text>
        </View>

        <View
          style={[
            styles.rewardsCard,
            {
              backgroundColor: GAMIFICATION_THEMES[selectedTheme].color + "20",
            },
          ]}
        >
          <Image
            source={{ uri: GAMIFICATION_THEMES[selectedTheme].icon }}
            style={styles.rewardsIcon}
          />
          <Text
            style={[
              styles.rewardsTitle,
              { color: GAMIFICATION_THEMES[selectedTheme].color },
            ]}
          >
            {GAMIFICATION_THEMES[selectedTheme].name}
          </Text>
          <Text
            style={[
              styles.rewardsValue,
              { color: GAMIFICATION_THEMES[selectedTheme].color },
            ]}
          >
            {achievementsData.themeRewards}
          </Text>
          <Text style={styles.rewardsDescription}>
            {GAMIFICATION_THEMES[selectedTheme].unit}
          </Text>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.streakContainer}>
        <Image source={{ uri: fireIcon }} style={styles.streakIcon} />
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.current}{" "}
            {achievementsData.streaks.current === 1 ? "Minute" : "Minutes"}
          </Text>
        </View>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Best Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.longest}{" "}
            {achievementsData.streaks.longest === 1 ? "Minute" : "Minutes"}
          </Text>
        </View>
      </View>

      {/* Achievement Milestones */}
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>Achievement Milestones</Text>
        <View style={styles.milestonesGrid}>
          {GAMIFICATION_THEMES[selectedTheme].rewards.map((reward, index) => {
            const unlocked = achievementsData.themeRewards >= reward.at;
            return (
              <View
                key={index}
                style={[
                  styles.milestone,
                  unlocked ? styles.milestoneUnlocked : styles.milestoneLocked,
                  unlocked && {
                    borderColor: GAMIFICATION_THEMES[selectedTheme].color,
                  },
                ]}
              >
                <Text style={styles.milestoneReward}>{reward.reward}</Text>
                <Text style={styles.milestoneDesc}>{reward.description}</Text>
                <View style={styles.milestoneRequirementContainer}>
                  {unlocked && (
                    <Image
                      source={{ uri: checkIcon }}
                      style={styles.checkIcon}
                    />
                  )}
                  <Text style={styles.milestoneRequirement}>
                    {unlocked
                      ? "Unlocked!"
                      : `Need ${reward.at} ${GAMIFICATION_THEMES[selectedTheme].unit}`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Activity</Text>
        {achievementsData.history.length > 0 ? (
          <View style={styles.historyContentContainer}>
            {achievementsData.history
              .slice(-5)
              .reverse()
              .map((entry, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <Image
                      source={{
                        uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234CAF50'/%3E%3Cpath d='M30 50 L45 65 L70 35' stroke='%23FFFFFF' stroke-width='6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
                      }}
                      style={styles.historyItemIcon}
                    />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyText}>
                      Good Posture Period Completed
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(entry.date)} at {formatTime(entry.time)}
                    </Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>+1 min</Text>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.noHistoryContainer}>
            <View style={styles.noHistoryIconContainer}>
              <Image
                source={{
                  uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 100 100'%3E%3Cg fill='%23E0E0E0'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23BDBDBD' stroke-width='2' fill='none'/%3E%3Cpath d='M35 40 Q50 30 65 40 Q50 50 35 40' fill='%23BDBDBD'/%3E%3Ccircle cx='40' cy='42' r='3' fill='%23757575'/%3E%3Ccircle cx='60' cy='42' r='3' fill='%23757575'/%3E%3Cpath d='M40 60 Q50 70 60 60' stroke='%23BDBDBD' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E",
                }}
                style={styles.noHistoryIcon}
              />
            </View>
            <Text style={styles.noHistoryTitle}>No Activity Yet</Text>
            <Text style={styles.noHistoryText}>
              Maintain good posture to earn points and see your progress here!
            </Text>
            <View style={styles.noHistoryTip}>
              <Text style={styles.noHistoryTipText}>
                💡 Tip: Connect your IMU sensor and start a session
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  headerContainer: {
    backgroundColor: "#5CA377",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  sensorStatusContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    flexDirection: "column",
  },
  sensorIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  sensorStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sensorConnected: {
    color: "#56a64b",
  },
  sensorDisconnected: {
    color: "#ff3b30",
  },
  sensorWarning: {
    fontSize: 14,
    color: "#ff3b30",
    textAlign: "center",
  },
  themeSelectorContainer: {
    marginBottom: 20,
  },
  themeSelectorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  themeSelectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeScrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  themeScrollContent: {
    paddingHorizontal: 8,
  },
  leftArrowButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rightArrowButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  arrowDisabled: {
    backgroundColor: "rgba(240, 240, 240, 0.5)",
    borderColor: "#C0C0C0",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  arrowIconDisabled: {
    opacity: 0.3,
  },
  themeCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  themeCardSelected: {
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  themeIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  themeCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  themeCardDesc: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    lineHeight: 12,
  },
  scrollIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: "#666",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeScrollView: {
    flex: 1,
  },
  statusContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  currentAchievementBanner: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  currentAchievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  currentAchievementDesc: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  nextAchievementContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  nextAchievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  progressVisualizationContainer: {
    marginVertical: 12,
  },
  progressTrack: {
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
  },
  progressLabels: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  progressStart: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  progressEnd: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  perfectSessionBanner: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
  },
  perfectSessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  perfectSessionDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  animatedAchievementContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    marginVertical: 20,
    position: "relative",
  },
  achievementIconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  largeAchievementIcon: {
    width: 120,
    height: 120,
  },
  particlesContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  rewardsCard: {
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  rewardsIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#BF9B30",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#BF9B30",
    marginBottom: 4,
  },
  pointsDescription: {
    fontSize: 12,
    color: "#78655C",
    textAlign: "center",
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rewardsValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rewardsDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  streakContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  streakTextContainer: {
    marginRight: 24,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D84315",
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D84315",
  },
  milestonesContainer: {
    marginBottom: 24,
  },
  milestonesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  milestonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  milestone: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  milestoneUnlocked: {
    backgroundColor: "#E8F5E9",
  },
  milestoneLocked: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  milestoneReward: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  milestoneDesc: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  milestoneRequirementContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  milestoneRequirement: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  historyContentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 2,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  historyIconContainer: {
    marginRight: 12,
  },
  historyItemIcon: {
    width: 24,
    height: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#757575",
  },
  historyBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  historyPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#56a64b",
    marginTop: 4,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    color: "#333",
  },
  historyDate: {
    fontSize: 12,
    color: "#757575",
  },
  noHistoryText: {
    fontSize: 14,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  noHistoryContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderStyle: "dashed",
  },
  noHistoryIconContainer: {
    marginBottom: 16,
  },
  noHistoryIcon: {
    width: 48,
    height: 48,
  },
  noHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 8,
  },
  noHistoryText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  noHistoryTip: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  noHistoryTipText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
});

export default Achievements;
