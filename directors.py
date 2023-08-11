#!/usr/bin/env python3

import argparse
import datetime
import os
import sys
from pathlib import Path
from urllib.parse import quote
import json, unidecode

from collections import OrderedDict

def process_dir(top_dir):
    path_top_dir = Path(top_dir)

    index_path = Path(path_top_dir, "index.html")

    try:
        index_file = open(index_path, 'w')
    except Exception as e:
        print('cannot create file %s %s' % (index_path, e))
        return

    index_file.write("""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>

/* !GLOBAL ------------------------------------------------------------------------------*/

html {
/*      -webkit-font-smoothing: subpixel-antialiased; */

/*
        -webkit-text-stroke: 1px transparent;
        text-rendering:optimizeLegibility;
        font-style: normal;
        font-weight: normal;
*/
}


body {
        background: #1f1f1f;
        font-family: "livory", Georgia, serif;
        color: #93aeb9;
        text-shadow: 0 1px 0 rgba(0,0,0,0.01);
}

a {
    text-decoration: none;
    color: #93aeb9
}

a:hover {
  color: gray;
  text-decoration: none;
}

h1 {
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        font-weight: 600;
        color: #8da6b0;

        line-height: 100%;
        font-size: 1.7em;
        padding-top: 10px;
        padding-bottom: 20px;

        text-shadow: 0px 1px 0px rgba(0,0,0,1.0);

}

h1 em {
        font-weight: normal;
        font-style: normal;
}


h2 {
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        font-weight: 600;
        color: #98b3bd;

        font-size: 1.25em;
        line-height: 115%;
        padding-top: 10px;
        padding-bottom: 4px;

        text-shadow: 0px 1px 0px rgba(0,0,0,1.0);

}

h2 em {
        font-weight: normal;
        font-style: normal;
        font-size: .92em;
}


h3 {
        font-size: 1.1em;
        font-weight: bold;
        font-style: italic;
        padding-top: 4px;
        padding-bottom: 0px;
}

h3 em {
        font-weight: normal;
        font-size: .9em;
        margin-left: 4px;
}


.footnote {
        font-size: .8em;
        letter-spacing: 1px;
        margin-left: 3px;
}

.added {
        color: #b47563;
}


#wrapper {
        width: 86%;
        margin: 60px auto 50px auto;
        padding: 20px 12px 20px 12px;

        overflow: auto;
}

.caption {
        float: right;
        font-size: .75em;
        margin-top: -8px;
        margin-bottom: -12px;
        color: RGBa(147, 174, 185,0.3);
}



/* !FINE PRINT ---------------------------------------------------------------------*/

.fineprint {
        font-family: "Lucida Grande", Verdana, sans-serif;
        font-size: 0.75em;
}

#main p.fineprint {
        font-family: "Lucida Grande", Verdana, sans-serif;
        font-size: 0.75em;
}

#sidebar p.fineprint {
        font-family: "Lucida Grande", Verdana, sans-serif;
        font-size: 0.75em;
        line-height: 150%;
}

#main p.asterisk {
        padding-top: 6px;
        font-size: 0.8em;
        line-height: 135%;
        text-indent: -8px;
}


/* !HORIZONTAL RULES (see also footer) ---------------------------------------------------------------------*/

hr {
        width: 100%;
    border: 0;


    height: 0;
    border-bottom: 1px solid #72858d;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);

        clear: both;


    padding-top: 8px;
}


#main hr {
        margin-bottom: 16px;

}



/* !SITE HEADLINE & HERO IMAGE -----------------------------------------------------------*/

/*
.tmwvtm {
        width: 734px;
        height: 50px;
        background-image: url(tmwvtm.png);
        background-size: 100%;
        background-repeat: no-repeat;
}
*/

#header img {
        margin-bottom: -4px;
}

#header img.header-b {
        width: 250px
        height: 35px;
}

.mainImage {
        margin-top: 12px;
        margin-bottom: 10px;
        width: 100%;
        height: 260px;

        background-size: 100%;
        background-repeat: no-repeat;
}


.lt-ie9 .mainImage {
        height: 360px;
}

/* !COLOR-CODING -------------------------------------------------------------------------*/

.blue {
        color: rgba(61,116,198,1);
/*      color: rgba(79,215,255,0.85); */
/*      color: #71c2ff; */
}

.lt-ie9 .blue {
        color: #48bcde;
}

.red {
        color: rgba(255,112,80,0.75);
}

.lt-ie9 .red {
        color: #c75c44;
}

.green {
        color: rgba(134,186,85,0.8);
}

.lt-ie9 .green {
        color: #85ab61;
}

.gold {
        color: rgba(244,211,80,0.9);

/*      color: rgba(238,193,79,.95); */
}

.lt-ie9 .gold {
        color: #dfc14b;
}

.orange {
        color: rgba(253,180,40,0.7);
}

.lt-ie9 .orange {
        color: #bb8825;
}

.fineprint .blue, .fineprint .red, .fineprint .green, .fineprint .gold , .fineprint .orange {
        font-weight: bold;
}


/* !IMAGES  ----------------------------------------------------------------------------*/


#main h2 img {
        width: 38px;
        height: 18px;
        margin-left: -4px;
        margin-right: -4px;
        vertical-align: -4px;
}

#main h2 img.rewatched {
        width: 22px;
        height: 12px;
        vertical-align: 1px;
        margin-left: 0px;
        margin-right: 0px;
}




/* !TOP NAV BAR  ----------------------------------------------------------------------------*/

#nav {

}

#nav ul {
        padding-left: 0;
        list-style: none;
        font-family: "omnes-pro","Lucida Grande", Verdana, sans-serif;
}

#nav li {
        float: left;
        padding: 4px 0 4px 0;

        font-weight: bold;
        font-size: 1em;
        text-shadow: 0px 1px 0px rgba(0,0,0,1.0);
}

#nav a {
        color: #93aeb9;
        text-decoration: none;

        padding-right: 9px;
        margin-right: 9px;

}

#nav a:hover{
        color: #fff;
}


#indexLink, #pastLink, #listLink, #aboutLink, #rankLink, #capsLink, #prevLink, #navLink  {
        border-right: 1px solid #bbb;
}

#linkLink, #nextLink, #rightcapsLink, #rightmostLink {
        border-right: none;
}

#index #indexLink,
#past #pastLink,
#list #listLink,
#about #aboutLink,
#link #linkLink,
#rank #rankLink,
#caps #capsLink,
#caps #rightcapsLink
 {
        font-weight: 600;
        color: #eee;
}

/*
#nav .nav-search-box {
        float: right;
        width: 35%;
        height: 10px;
        margin-left: -7px;
        margin-top: -5px;
        margin-bottom: -10px;
}
*/



/* !MAIN  ----------------------------------------------------------------------------*/

#main {
        width: 65%;
        margin: 0px 0px 20px 0px;
        float: left;
}

#main.no-sidebar {
        width: 100%;

        margin: 0px 0px 0px 0px;
        float: none;
}

#main.no-headline {
        margin-top: 24px;
}

#main p {
        font-size: 1em;
        line-height: 120%;
        margin-bottom: 10px;
}

#main ul {
        list-style-type:disc;
        padding-bottom: 10px;
}

#main ul.paragraph-bullets li {
        padding-bottom: 10px;
}


/* !BOX LINKS for LISTS.html ----------------------------------------------------------------------------*/


#main p.box-link {
        font-family: "letter-gothic-std", Monaco, "Lucida Console", monospace;
        font-size: 0.77em;
        font-weight: bold;
        letter-spacing: 1px;
        line-height: 250%;
        margin-top: 3px;

}

#main p.box-link a {
        color: #93aeb9;
        background-color: rgba(147,174,185,0.2);

        border: 1px solid rgba(147,174,185,0.5);

        padding: 4px 6px 3px 6px;
        margin: 0px 2px 0px 0px;

        border-radius: 5px;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;

        white-space: nowrap;

}


.lt-ie9 #main p.box-link a {
        color: #93aeb9;
        background-color: #48575c;

        border: 1px solid #8098a2;

        padding: 2px 6px 2px 6px;
        margin: 0px 2px 0px 0px;

}

.lt-ie8 #main p.box-link a {

        margin: 0px 2px 0px 2px;

}


#main p.box-link a:hover {
        color: #fff;
        background-color: rgba(147,174,185,0.6);
        }


/* !SIDEBAR ----------------------------------------------------------------------------*/


#sidebar {
        width: 30%;
        float: right;
        margin-top: 58px;
}

#index #sidebar,
#past #sidebar,
#list #sidebar,
#about #sidebar,
#link #sidebar {
                margin-top: 16px;
}

#sidebar.no-headline {
        margin-top: 24px;
}

#sidebar.h2-headline {
        margin-top: 39px;
}


#sidebar p {
        margin-bottom: 10px;
}


/* !SIDEBAR NAVIGATION MENU ------------------------------------------------------------------*/


#sidebar ul {
        list-style: none;
}

.lt-ie8 #sidebar ul {
        margin-top: 0px;
}

#sidebar ul.sbnav li {
        background-color: #506066;

        text-align: center;
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        text-transform: uppercase;

        letter-spacing: 2px;
        line-height: 110%;
        font-size: 0.9em;

        text-shadow: 0px 1px 0px rgba(0,0,0,0.7);


        padding: 14px 8px 14px 8px;
        margin-bottom: 8px;
}

#sidebar ul.sbnav li.donate {
        background-color: rgba(253,180,40,0.7);

}


.lt-ie9 #sidebar ul.sbnav li {
        text-shadow: none;
}

.lt-ie8 #sidebar ul.sbnav li {
        height: 18px;
        background-color: #506066;
        padding: 18px 8px 14px 8px;

}


#sidebar ul.sbnav li:hover {
        background-color: #93aeb9;

}

/* !SEARCH ------------------------------------------------------------------*/

.gsc-input {
                color: #1f1f1f;
                font-family: livory, Georgia, serif;
                font-size: .7em;
}


.sidebar-search-box {
        margin-top: 18px;
        margin-left: 22px;
/*      visibility: hidden; */
}


/* !ALPHABETICAL NAVIGATION MINI-NAV -------------------------------------------------------------------*/


.nav_a-z {
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        font-size: 1.15em;
        color: rgb(142,176,190);
        color: rgba(121,146,157,0.8);
        line-height: 220%;
        margin-top: 24px;
        margin-bottom: 24px;
}

#mqdall .nav_a-z {
        font-size: 1.15em;
        margin-bottom: 24px;
}

#mqdall .nav_a-z a {
        padding-left: 9px;
        padding-right: 9px;

        white-space: nowrap;
}



#mmm .nav_a-z {
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        font-size: .95em;
        color: rgb(142,176,190);
        color: rgba(121,146,157,0.8);
        line-height: 220%;
        margin-top: 10px;
        margin-bottom: 10px;

        text-indent: 0;
        margin-left: -.94em;
}

#mmm #a-index {
        margin-left: 0;
}


#mmm .nav_a-z a {
        padding-left: 7px;
        padding-right: 7px;

        white-space: nowrap;
}

#a-index #a-index-link,
#b-index #b-index-link,
#c-index #c-index-link,
#d-index #d-index-link,
#e-index #e-index-link,
#f-index #f-index-link,
#g-index #g-index-link,
#h-index #h-index-link,
#i-index #i-index-link,
#j-index #j-index-link,
#k-index #k-index-link,
#l-index #l-index-link,
#m-index #m-index-link,
#n-index #n-index-link,
#o-index #o-index-link,
#p-index #p-index-link,
#q-index #q-index-link,
#r-index #r-index-link,
#s-index #s-index-link,
#t-index #t-index-link,
#u-index #u-index-link,
#v-index #v-index-link,
#w-index #w-index-link,
#x-index #x-index-link,
#y-index #y-index-link,
#z-index #z-index-link {
        font-weight: bold;
        color: #93aeb9;
}



/* !2-COLUMNS  --------------------------------------------------------------------------------------*/

#left-column {
        width: 49%;
        float: left;
}

#right-column {
        width: 49%;
        float: right;
}

/* !MASTER LIST BY DIRECTOR - mmm.html -----------------------------------------------------------------*/

b {
        font-size: 1.3em;
}

li {
        padding-left: .94em;
        text-indent: -.94em;
        list-style: none;

}

.rating {
        font-family: "letter-gothic-std", Monaco, "Lucida Console", monospace;
        color: #dca73c;
        color: rgba(253,180,40,0.7);

        font-size: .8em;
        font-weight: bold;

        margin-left: 4px;
}

.number {
        font-family: "omnes-pro", "Lucida Grande", Verdana, sans-serif;
        font-size: 1em;
        letter-spacing: 2px;
        margin-left: 2px;
        color: rgba(147, 174, 185, 0.8);
}


/* !RESPONSIVE CHANGES ------------------------------------------------------------------------------------*/

/* !1400 PIXELS AND WIDER ------------------------------------------------------------------------------------*/

        @media screen and (min-width: 1400px) {

                #wrapper {
                        width: 1200px;
                }

}

/* !768 PIXELS AND NARROWER (iPad portrait) -----------------------------------------------------------------------*/

        @media screen and (max-width: 768px) {

/* !GLOBAL - Responsive Changes - 768px */

#wrapper {
        margin-top: 30px;
}

h1 {
        font-size: 1.55em;
}




/* !SITE HEADLINE & HERO IMAGE - Responsive Changes - 768px */

/*
.tmwvtm {
        width: 516px;
        background-size: 743px;
}

*/

.mainImage {
        height: 200px;
}

        .caption {
        visibility: hidden;
        float:none;

}


/* !MAIN */


#main {
        width: 60%;
}

/* !SIDEBAR - Responsive Changes - 768px */

#sidebar {
        width: 35%;
}

#sidebar p.fineprint {
        line-height: 170%;
}

/* !SIDEBAR NAVIGATION MENU - Responsive Changes - 768px */


#sidebar ul.sbnav li {
        font-size: 0.7em;
}


/* !SIDEBAR SEARCH - Responsive Changes - 768px */

/*
.sidebar-search-box {
        visibility: visible;
}

#nav .nav-search-box {
        visibility: hidden;
}
*/


/* !FOOTER - Responsive Changes - 768px */

hr.footer-hr {
    padding-top: 0px;
}


/* !FILMS SEEN - mqd.html - Responsive Changes - 768px */


#mqd-old #main p {
                padding-left: 3.2em;
                text-indent: -3.2em;
}

/* !RATINGS BY YEAR - XXXX.html - Responsive Changes - 768px */

/* STANDARD RANKINGS */

#rank h2 {
        margin-top: 12px;
}

#rank #main li {
        text-indent: -28px;
        padding-left: 28px;
}

#rank #main li b {
        font-size: 1em;
}

#rank #main li img {
        width: 34px;
        height: 16px;
        margin-right: -3px;
}

/* TOP TEN */

#rank #main #top-ten {
        padding-right: 0px;
}

#rank #main #top-ten li b {
        font-size: 1.25em;
}

#rank #main #top-ten li em {
        font-size: 1em;
}



/* !REVIEWS BY TITLE - capsXX.html - Responsive Changes - 768px */


#caps #main li {
        line-height: 110%;
}

#caps #main li b {
        font-size: 1em;

}

#caps #main li img {
        width: 30px;
        height: 14px;
        margin-left: -7px;
        vertical-align: -2px;
}

/* !100 PT SCALE - 100ptscale.html - Responsive Changes - 768px */

#scale #main p {
        margin-bottom: 10px;
        text-indent: -3.85em;
        padding-left: 3.85em;

}

#scale strong {
        font-size: .8em;
}


/* !BY GRADE - bygrade.html - CURRENT YEAR ONLY - Responsive Changes - 768px */

.by-grade-intro td {
        font-size: 0.7em;

}

/* !OLDER MOVIES BY LETTER GRADE retrobygrade.html - Responsive Changes - 768px */


#retrobygrade #main p {
        font-size: 1em;
        }

#retrobygrade #main .year-director {
        font-size: 1em;
        }

#retrobygrade #main img {
        width: 35px;
        height: 16px;
        margin-left: -7px;
        vertical-align: -4px;
        }




} /* End of 768px responsive changes */

/* !480 PIXELS AND NARROWER (Android portrait, iPhone landscape) ---------------------------------------------------------*/

        @media screen and (max-width: 480px) {

/* !GLOBAL - Responsive Changes - 480px */

#wrapper {
        width: 100%;
        margin: 0px auto 30px auto;
        padding: 20px 0px 20px 0px;
}

h1 {
        width: 80%;
        font-size: 1.4em;
        margin-left: 0px;
        padding-top: 0px;
        padding-bottom: 14px;

}

h2 {
        padding-top: 7px;
}



/* !FINE PRINT  - Responsive Changes - 480px */

.fineprint {
        font-size: 0.65em;
}

#main p.fineprint {
        font-size: 0.65em;
}

#sidebar p.fineprint {
        font-size: 0.65em;
}

/* !SITE HEADLINE & HERO IMAGE - Responsive Changes - 480px */

/*
.tmwvtm {
        width: 288px;
        height: 30px;
        background-size: 420px;
        margin-left: 15px;
}
*/

#header img {
        height: 0px;
        visibility: hidden;
        margin-bottom: -20px;
}

#header img:first-child {
        width: 290px;
        height: 29px;
        margin-left: 15px;
        visibility: visible;
}


.mainImage {
        margin-top: 6px;
        height: 130px;
}


/* !TOP NAV BAR - Responsive Changes - 480px */

#nav {
        margin-top: 4px;
}

#nav ul {
        margin-left: 15px;
        margin-right: 6px;

}

#nav li {
        font-size: 0.83em;

}

#rank #nav li, #caps #nav li {
        font-size: 0.83em;

}

#rank #nav a, #caps #nav a  {

        padding-right: 8px;
        margin-right: 8px;

}

/* !MAIN - Responsive Changes - 480px */


#main {
        width: 90%;
        margin: 15px 15px 5px 15px;
        float: none;
}

#main.no-sidebar {
        width: 90%;

        margin: 15px 15px 15px 15px;
}

#main p {
        line-height: 130%;
}

#main p.box-link {
        line-height: 280%;
        font-size: 0.8em;
        padding-right: 0px
}

#main p.box-link a {
        margin: 0px 1px 0px 0px;

}


/* !SIDEBAR - Responsive Changes - 480px */

#sidebar {
        width: 100%;
        padding: 10px 0 0 0;
        float: none;
        margin-top: 0px;
}

#sidebar p.fineprint {
        margin: 15px 15px 15px 15px;
}

/* !SIDEBAR NAVIGATION MENU - Responsive Changes - 480px */


#sidebar ul {
        margin-left: -25px;
        margin-top: 0px;
}

#sidebar ul.sbnav li {
        font-size: 1.0em;
        padding: 14px 10% 14px 10%;
        margin-left: 18px;
        margin-right: 18px;
}



/* !SIDEBAR SEARCH  - Responsive Changes - 480px */

.sidebar-search-box {
        margin-top: 20px;
        margin-left: 16px;
        margin-right: 18px;
}


/* !2-COLUMNS - Responsive Changes - 480px */

#left-column {
        width: 100%;
        float: none;
}

#right-column {
        width: 100%;
        float: none;
}


/* !FOOTER - Responsive Changes - 480px */


#footer p {
        font-size: 0.7em;
        margin-left: 15px;
        margin-right: 15px;
}


/* !FILMS SEEN - mqd.html - Responsive Changes - 480px */

#main p.seen {
        padding-left: 35px;
        text-indent: -35px;
        line-height: 110%;
        margin-bottom: 4px;
}

.seen b {
        font-size: 1em;
}

.seen em {
        font-size: 1em;
}

.seen .rating {
        width: 34px;
        height: 16px;
}



#mqd-old #main p {
        font-size: .75em;
}

#mqd-old h1 {
        padding-bottom: 7px;
}

#mqd-old #main hr {

}

/* !RATINGS BY YEAR - XXXX.html - Responsive Changes - 480px */

/* STANDARD RANKINGS */

#rank h2 {
        font-size: 1.4em;
        line-height: 100%;
        padding-right: 45px;
        padding-bottom: 16px;
}


#rank #main li {
        line-height: 110%;
        padding-bottom: 6px;
}

/* TOP TEN */

#rank #main #top-ten li {
        line-height: 120%;
        padding-bottom: 6px;
}

/* !BY GRADE - bygrade.html - CURRENT YEAR ONLY - Responsive Changes - 480px */

#bygrade h2 {
        font-size: 1em;
        }

.by-grade-intro td {
        font-size: 0.45em;
        padding-right: 12px;

        }

.by-grade-film td {
        text-align: left;
        font-size: .6em;

        padding-top: 4px;
        padding-bottom: 2px;
        padding-left: 6px;
        padding-right: 4px;
        }

.by-grade-film td .rating {
        font-size: .5em;
        color: rgb(253,180,40);
        color: rgba(253,180,40,1.0);
}


/* !MASTER LIST BY DIRECTOR - mmm.html - Responsive Changes - 480px */

#mmm b {
        font-size: 1.1em;
}



} /* End of 480px responsive changes */

/* !320 PIXELS AND NARROWER (Android portrait, iPhone portrait) ---------------------------------------------------------*/

        @media screen and (max-width: 320px) {

/* !SITE HEADLINE & HERO IMAGE  - Responsive Changes - 320px */


.mainImage {
        height: 156px;
/*      180 px high is full 16:9 proportions */
}


/* !TOP NAV BAR  - Responsive Changes - 320px */

#nav ul {
        margin-left: 15px;
        margin-right: 0px;
}

#rank #nav li, #caps #nav li {
        font-size: 0.7em;
        }

#rank #nav a, #caps #nav a  {
        padding-right: 6px;
        margin-right: 6px;
        }

/* LISTS PAGE */

#list #main {
        margin-right: 0px;
}

} /* End of 320px responsive changes */
    </style>
</head>
<body>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="0" width="0" style="position: absolute;">
    <defs>
        <!-- Go-up -->
        <g id="go-up">
            <path d="M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z" fill="#696969"/>
        </g>

        <!-- Folder -->
        <g id="folder" fill-rule="nonzero" fill="none">
            <path d="M285.22 37.55h-142.6L110.9 0H31.7C14.25 0 0 16.9 0 37.55v75.1h316.92V75.1c0-20.65-14.26-37.55-31.7-37.55z" fill="#FFA000"/>
            <path d="M285.22 36H31.7C14.25 36 0 50.28 0 67.74v158.7c0 17.47 14.26 31.75 31.7 31.75H285.2c17.44 0 31.7-14.3 31.7-31.75V67.75c0-17.47-14.26-31.75-31.7-31.75z" fill="#FFCA28"/>
        </g>
        <g id="folder-shortcut" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="folder-shortcut-group" fill-rule="nonzero">
                <g id="folder-shortcut-shape">
                    <path d="M285.224876,37.5486902 L142.612438,37.5486902 L110.920785,0 L31.6916529,0 C14.2612438,0 0,16.8969106 0,37.5486902 L0,112.646071 L316.916529,112.646071 L316.916529,75.0973805 C316.916529,54.4456008 302.655285,37.5486902 285.224876,37.5486902 Z" id="Shape" fill="#FFA000"></path>
                    <path d="M285.224876,36 L31.6916529,36 C14.2612438,36 0,50.2838568 0,67.7419039 L0,226.451424 C0,243.909471 14.2612438,258.193328 31.6916529,258.193328 L285.224876,258.193328 C302.655285,258.193328 316.916529,243.909471 316.916529,226.451424 L316.916529,67.7419039 C316.916529,50.2838568 302.655285,36 285.224876,36 Z" id="Shape" fill="#FFCA28"></path>
                </g>
                <path d="M126.154134,250.559184 C126.850974,251.883673 127.300549,253.006122 127.772602,254.106122 C128.469442,255.206122 128.919016,256.104082 129.638335,257.002041 C130.559962,258.326531 131.728855,259 133.100057,259 C134.493737,259 135.415364,258.55102 136.112204,257.67551 C136.809044,257.002041 137.258619,255.902041 137.258619,254.577551 C137.258619,253.904082 137.258619,252.804082 137.033832,251.457143 C136.786566,249.908163 136.561779,249.032653 136.561779,248.583673 C136.089726,242.814286 135.864939,237.920408 135.864939,233.273469 C135.864939,225.057143 136.786566,217.514286 138.180246,210.846939 C139.798713,204.202041 141.889234,198.634694 144.429328,193.763265 C147.216689,188.869388 150.678411,184.873469 154.836973,181.326531 C158.995535,177.779592 163.626149,174.883673 168.481552,172.661224 C173.336954,170.438776 179.113983,168.665306 185.587852,167.340816 C192.061722,166.218367 198.760378,165.342857 205.481514,164.669388 C212.18017,164.220408 219.598146,163.995918 228.162535,163.995918 L246.055591,163.995918 L246.055591,195.514286 C246.055591,197.736735 246.752431,199.510204 248.370899,201.059184 C250.214153,202.608163 252.079886,203.506122 254.372715,203.506122 C256.463236,203.506122 258.531277,202.608163 260.172223,201.059184 L326.102289,137.797959 C327.720757,136.24898 328.642384,134.47551 328.642384,132.253061 C328.642384,130.030612 327.720757,128.257143 326.102289,126.708163 L260.172223,63.4469388 C258.553756,61.8979592 256.463236,61 254.395194,61 C252.079886,61 250.236632,61.8979592 248.393377,63.4469388 C246.77491,64.9959184 246.07807,66.7693878 246.07807,68.9918367 L246.07807,100.510204 L228.162535,100.510204 C166.863084,100.510204 129.166282,117.167347 115.274437,150.459184 C110.666301,161.54898 108.350993,175.310204 108.350993,191.742857 C108.350993,205.279592 113.903236,223.912245 124.760454,247.438776 C125.00772,248.112245 125.457294,249.010204 126.154134,250.559184 Z" id="Shape" fill="#FFFFFF" transform="translate(218.496689, 160.000000) scale(-1, 1) translate(-218.496689, -160.000000) "></path>
            </g>
        </g>

        <!-- File -->
        <g id="file" stroke="#000" stroke-width="25" fill="#FFF" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 24.12v274.76c0 6.16 5.87 11.12 13.17 11.12H239c7.3 0 13.17-4.96 13.17-11.12V136.15S132.6 13 128.37 13H26.17C18.87 13 13 17.96 13 24.12z"/>
            <path d="M129.37 13L129 113.9c0 10.58 7.26 19.1 16.27 19.1H249L129.37 13z"/>
        </g>
        <g id="file-shortcut" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="file-shortcut-group" transform="translate(13.000000, 13.000000)">
                <g id="file-shortcut-shape" stroke="#000000" stroke-width="25" fill="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M0,11.1214886 L0,285.878477 C0,292.039924 5.87498876,296.999983 13.1728373,296.999983 L225.997983,296.999983 C233.295974,296.999983 239.17082,292.039942 239.17082,285.878477 L239.17082,123.145388 C239.17082,123.145388 119.58541,2.84217094e-14 115.369423,2.84217094e-14 L13.1728576,2.84217094e-14 C5.87500907,-1.71479982e-05 0,4.96022995 0,11.1214886 Z" id="rect1171"></path>
                    <path d="M116.37005,0 L116,100.904964 C116,111.483663 123.258008,120 132.273377,120 L236,120 L116.37005,0 L116.37005,0 Z" id="rect1794"></path>
                </g>
                <path d="M47.803141,294.093878 C48.4999811,295.177551 48.9495553,296.095918 49.4216083,296.995918 C50.1184484,297.895918 50.5680227,298.630612 51.2873415,299.365306 C52.2089688,300.44898 53.3778619,301 54.7490634,301 C56.1427436,301 57.0643709,300.632653 57.761211,299.916327 C58.4580511,299.365306 58.9076254,298.465306 58.9076254,297.381633 C58.9076254,296.830612 58.9076254,295.930612 58.6828382,294.828571 C58.4355724,293.561224 58.2107852,292.844898 58.2107852,292.477551 C57.7387323,287.757143 57.5139451,283.753061 57.5139451,279.95102 C57.5139451,273.228571 58.4355724,267.057143 59.8292526,261.602041 C61.44772,256.165306 63.5382403,251.610204 66.0783349,247.62449 C68.8656954,243.620408 72.3274172,240.35102 76.4859792,237.44898 C80.6445412,234.546939 85.2751561,232.177551 90.1305582,230.359184 C94.9859603,228.540816 100.76299,227.089796 107.236859,226.006122 C113.710728,225.087755 120.409385,224.371429 127.13052,223.820408 C133.829177,223.453061 141.247152,223.269388 149.811542,223.269388 L167.704598,223.269388 L167.704598,249.057143 C167.704598,250.87551 168.401438,252.326531 170.019905,253.593878 C171.86316,254.861224 173.728893,255.595918 176.021722,255.595918 C178.112242,255.595918 180.180284,254.861224 181.82123,253.593878 L247.751296,201.834694 C249.369763,200.567347 250.291391,199.116327 250.291391,197.297959 C250.291391,195.479592 249.369763,194.028571 247.751296,192.761224 L181.82123,141.002041 C180.202763,139.734694 178.112242,139 176.044201,139 C173.728893,139 171.885639,139.734694 170.042384,141.002041 C168.423917,142.269388 167.727077,143.720408 167.727077,145.538776 L167.727077,171.326531 L149.811542,171.326531 C88.5120908,171.326531 50.8152886,184.955102 36.9234437,212.193878 C32.3153075,221.267347 30,232.526531 30,245.971429 C30,257.046939 35.5522422,272.291837 46.4094607,291.540816 C46.6567266,292.091837 47.1063009,292.826531 47.803141,294.093878 Z" id="Shape-Copy" fill="#000000" fill-rule="nonzero" transform="translate(140.145695, 220.000000) scale(-1, 1) translate(-140.145695, -220.000000) "></path>
            </g>
        </g>
    </defs>
    </svg>
<header>
    <h1>All films I've watched, per director (with latest rating, if any)</h1>
    <p>Only included directors with more than one film. Layout shamelessly copied from <a href="https://www.panix.com/~dangelo/mmm.html">Mike D'Angelo's</a>.</p>
                 </header>
                 <main>
                    <p style="font-size:20px">
                        <a href="#a" style="font-size:20px">A</a> &sdot;
                        <a href="#b" style="font-size:20px">B</a> &sdot;
                        <a href="#c" style="font-size:20px">C</a> &sdot;
                        <a href="#d" style="font-size:20px">D</a> &sdot;
                        <a href="#e" style="font-size:20px">E</a> &sdot;
                        <a href="#f" style="font-size:20px">F</a> &sdot;
                        <a href="#g" style="font-size:20px">G</a> &sdot;
                        <a href="#h" style="font-size:20px">H</a> &sdot;
                        <a href="#i" style="font-size:20px">I</a> &sdot;
                        <a href="#j" style="font-size:20px">J</a> &sdot;
                        <a href="#k" style="font-size:20px">K</a> &sdot;
                        <a href="#l" style="font-size:20px">L</a> &sdot;
                        <a href="#m" style="font-size:20px">M</a> &sdot;
                        <a href="#n" style="font-size:20px">N</a> &sdot;
                        <a href="#o" style="font-size:20px">O</a> &sdot;
                        <a href="#p" style="font-size:20px">P</a> &sdot;
                        <a href="#q" style="font-size:20px">Q</a> &sdot;
                        <a href="#r" style="font-size:20px">R</a> &sdot;
                        <a href="#s" style="font-size:20px">S</a> &sdot;
                        <a href="#t" style="font-size:20px">T</a> &sdot;
                        <a href="#u" style="font-size:20px">U</a> &sdot;
                        <a href="#v" style="font-size:20px">V</a> &sdot;
                        <a href="#w" style="font-size:20px">W</a> &sdot;
                        <a href="#x" style="font-size:20px">X</a> &sdot;
                        <a href="#y" style="font-size:20px">Y</a> &sdot;
                        <a href="#z" style="font-size:20px">Z</a>
                    </p>
                 <div class="listing">
                 """)


    directed = {}

    # TODO: need to do the collecting of information from the master.json file, then populate this html
    with open("public/master.json", "rb") as master:
        data = json.load(master)
        for m in data["movies"]:
            if m["runtime"] < 40 or not m["status"]:
                continue
            for d in m["directors"]:
                if d not in list(directed):
                    directed[d] = []
                directed[d] += [m]
        ## this sorts by how many watched
          # directed = OrderedDict(sorted(directed.items(), key = lambda x: len(x[1]), reverse = True))
        # this sorts by last name
        directed = list(OrderedDict(sorted(directed.items(), key = lambda x: unidecode.unidecode(x[0].split(" ")[-1]))).items())
        index_file.write(f"""
        <a name="a"></a>
""")

        for i in range(0, len(directed)):
            k, v = directed[i]
            if i > 0:
              initLetter = unidecode.unidecode(k.split(" ")[-1][0])
              lastLetter = unidecode.unidecode(directed[i-1][0].split(" ")[-1][0])
              # print("test with ", k, " vs ", directed[i-1][0])
              # print("test with ", initLetter, " vs ", lastLetter)
              if initLetter != lastLetter:
                  index_file.write(f"""
                  <a name="{initLetter.lower()}"></a>
""")
              # else:
                  # print("..they're the same")
            if len(v) < 2:
                continue
            dirRegex = k.replace(" ", ".").lower()
            index_file.write(f"""
            <hr>
            <a href="../?director={dirRegex}"><b>{k}</b></a> <span class="number">[{len(v)}]</span><p>
""")
            v = sorted(v, key = lambda x:x["year"])
            for m in v:
                rating = ("<a href=\"" + m["diary"][-1]["entryURL"] + "\"><span class=\"rating\">" + m["diary"][-1]["rating"]["str"] + "</span></a>") if m["diary"] and m["diary"][-1]["rating"]["num"] > 0 else ""
                index_file.write(f"""
                <li><a href="{m["lbURL"]}">{m["title"]} ({m["year"]})</a> {rating}</li>
""")
            index_file.write(f"""<p>""")
    index_file.write("""
    </div>
</main>
</body>
</html>""")
    if index_file:
        index_file.close()


if __name__ == "__main__":
    process_dir("directors")
