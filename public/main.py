from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta

import math, re, argparse, csv, codecs, statistics, unidecode

import js
# files
from my_js_namespace import master
from my_js_namespace import diary
from my_js_namespace import watched
from my_js_namespace import watchlist
from my_js_namespace import mapping

# args
from my_js_namespace import name
from my_js_namespace import year
from my_js_namespace import date
from my_js_namespace import rating
from my_js_namespace import runtime
from my_js_namespace import director
from my_js_namespace import writer
from my_js_namespace import actor
from my_js_namespace import genre
from my_js_namespace import sorting
from my_js_namespace import unrated
from my_js_namespace import src

fileFromSrc = {"diary" : "data/diary.csv", "watchlist" : "data/watchlist.csv", "watched" : "data/watched.csv"}

nameOfMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def isUnrated(name, year):
  with open ("data/ratings.csv", "rb") as ratings:
    ratings = list(csv.reader(codecs.iterdecode(ratings, 'utf-8'), delimiter = ','))[1:]
    return not list(filter(lambda x : x[1].lower() == name.lower() and x[2] == year, ratings))

def getPattern(p):
  return datetime.strptime(p, '%Y' if len(p) == 4 \
                           else ('%Y%m' if len(p) <= 6 else '%Y%m%d'))

def filterDiary(row, name, tags, fyear, wdate, rating):
  # if len(row) != 8:
  #   debug = "Got malformed row: {0}\n\twith length {1}".format(row, len(row))
  #   js.debug = debug
  #   return False
  keep = True
  if name:
    keep = keep and (re.match(name, row[1], re.IGNORECASE) or name.lower() in row[1].lower())
  if rating:
    # can only filter by rating if diary. Otherwise we are just selecting for unrated
    assert len(row) > 4 or rating == -1
    if rating == -1:
      # if diary, unrated if no rating in entry. Otherwise unrated if not in ratings file
      keep = keep and (not row[4] if len(row) > 4 \
                       else isUnrated(row[1], row[2]))
    else:
      if ".." in rating:
        splitRating = rating.split("..")
        lb = int(splitRating[0])
        ub = int(splitRating[1])
      else:
        lb = int(rating)
        ub = int(rating)
      givenRating = int(float(row[4])*2) if row[4] else 0
      keep = keep and givenRating and givenRating >= lb and givenRating <= ub
  if fyear:
    if not row[2]:
      return False
    split = [fyear, fyear]
    if ".." in fyear:
      split = fyear.split("..")
    lb = datetime.strptime(split[0], '%Y')
    ub = datetime.strptime(split[1], '%Y') + relativedelta(month=12,day=31)
    filmYear = datetime.strptime(row[2], '%Y')
    keep = keep and filmYear >= lb and filmYear <= ub
  if wdate:
    entryDate = datetime.strptime(row[7], "%Y-%m-%d")
    if ".." in wdate:
      splitDates = wdate.split("..")
      try:
        since = getPattern(splitDates[0])
      except:
        return False
      # we get the end of the year/month for second pattern in case days were not given
      p = splitDates[1]
      try:
        until = datetime.strptime(p, '%Y') + relativedelta(month=12,day=31) \
          if len(p) == 4 else datetime.strptime(p, '%Y%m') + relativedelta(day=31) \
          if len(p) <= 6 else datetime.strptime(p, '%Y%m%d')
      except:
        return False
        # print("Invalid data format {0}".format(p))
    else:
      try:
        since = getPattern(wdate)
      except:
        return False
      # until will be the end of the year if only year given or end of month if only month given
      try:
        until = datetime.strptime(wdate, '%Y') + relativedelta(month=12,day=31) \
          if len(wdate) == 4 else \
          datetime.strptime(wdate, '%Y%m') + relativedelta(day=31) \
          if len(wdate) <= 6 else datetime.strptime(wdate, '%Y%m%d')
      except:
        return False
        # print("Invalid data format {0}".format(wdate))
    keep = keep and entryDate >= since and entryDate <= until
  # check tag
  if tags:
    currTags = [x.strip() for x in row[6].split(',')]
    found = False
    for tag in tags:
      for currTag in currTags:
        if re.match(tag, currTag, re.IGNORECASE):
          found = True
          break
    keep = keep and found
  return keep

def findInTuples(tuples, match):
  entries = tuples.split("), ")
  for entry in entries:
    if not entry:
      continue
    curr = entry.split(";")[0][1:]
    if re.match(match, curr, re.IGNORECASE) or match.lower() in curr.lower():
      return True
  return False

# Keeps any that matches all
def filterMaster(row, director, writer, actor, genre, runtime, credited):
  keep = True
  if director:
    cleanDirMaster = unidecode.unidecode(row[5])
    if row[0] == "97989":
      js.debug = "Clean dir: {0}".format(cleanDirMaster)
    keep = keep and findInTuples(cleanDirMaster, director)
  if writer:
    cleanWriterMaster = unidecode.unidecode(row[6])
    keep = keep and findInTuples(cleanWriterMaster, writer)
  if actor:
    found = False
    cleanActorMaster = unidecode.unidecode(row[7])
    if not credited:
      found = findInTuples(cleanActorMaster, actor)
    else:
      entries = cleanActorMaster.split("), ")
      for entry in entries:
        if not entry:
          continue
        curr = entry.split(";")[0][1:]
        role = entry.split(";")[2][:-1]
        if not "uncredited" in role and re.match(actor, curr, re.IGNORECASE) or actor.lower() in curr.lower():
          found = True
          break
    keep = keep and found
  if genre:
    found = False
    entries = row[4].split(", ")
    for entry in entries:
      if re.match(genre, entry, re.IGNORECASE) or genre.lower() in entry.lower():
        found = True
        break
    keep = keep and found
  if runtime:
    if ".." in runtime:
      splitRuntime = runtime.split("..")
      lb = int(splitRuntime[0])
      ub = int(splitRuntime[1])
    else:
      lb = int(runtime)
      ub = int(runtime)
    givenRuntime = int(row[3])
    keep = keep and givenRuntime >= lb and givenRuntime <= ub
  return keep

def getId(mapping, f):
  matched = list(filter(lambda x : len(x) > 1 and (x[1] == f[3] \
                        or (x[2] == f[1] and x[3] == f[2])), mapping))
  assert not matched or len(matched) == 1, \
    "Got more than on match: {0}".format(matched)
  return matched[0][0] if matched and matched[0][0] != "_" else None

def getFilms(filmList, name=None, tags=None, fyear=None, \
             date=None, rating=None, director=None, writer=None, actor=None, \
             genre=None, runtime=None, credited=False, sort="watched"):
    # filter by info already in films file
    films = list(filter(lambda x: \
                        filterDiary(x, name, tags, fyear, date, rating), \
                        filmList))
    if not films:
      return []
    # maybe filter by master info
    masterFiltered = list(filter(lambda x: \
                                 filterMaster(x, director, writer, actor, \
                                              genre, runtime, credited), master)) \
                                              if (director or writer or actor \
                                                  or genre or runtime) \
                                              else master
    debug = ""

    for m in masterFiltered:
      if not len(m) > 1:
        debug += "\n\tMasterFiltered row with weird length {0}".format(m)

    newFilms = []
    for f in films:
      tmdbId = getId(mapping, f)
      matched = list(filter(lambda x : len(x) > 1 and (x[0] == tmdbId if tmdbId \
                            else x[1].lower() == f[1].lower() and x[2] == f[2]), \
                            masterFiltered))
      if matched and len(matched) == 1:
        # replace logged date by master info
        f[0] = matched[0]
        # replace int rating by pair of its string rep (x+, x-, or x) and its
        # floating equiv (x.75, x.25, or x)
        if src == "diary":
          if not f[4]:
            f[4] = ("_", 0)
          elif "high" in f[6]:
            f[4] = (str(float(f[4])*2) + "↑", float(f[4])*2 + 0.75)
          elif "low" in f[6]:
            f[4] = (str(float(f[4])*2) + "↓", float(f[4])*2 + 0.25)
          else:
            f[4] = (str(float(f[4])*2), float(f[4])*2 + 0.5)
        newFilms += [f]
    films = newFilms

    if sort == "watched":
      # already sorted but in reverse order
      films = films[::-1]
    elif sort == "rating":
      films = sorted(films, key = lambda x : x[4][1], reverse=True)
    elif sort == "year":
      films = sorted(films, key = lambda x : int(x[0][2]), reverse=True)
    elif sort == "runtime":
      films = sorted(films, key = lambda x : int(x[0][3]) if int(x[0][3]) > 0 else 10000)
    return films

def func():
  assert src == "diary" or src == "watched" or src == "watchlist"
  inputFile = diary if src == "diary" else watched if src == "watched" else watchlist
  films = getFilms(inputFile, name=name, fyear=year, date=date, \
                   rating= -1 if unrated else rating, director=director, \
                   writer=writer, actor=actor, genre=genre, runtime=runtime, sort=sorting)
  json = ""
  if len(films) :
    json = "{\"items\" : [\n"
    for i in range(0, len(films)):
      f = films[i]
      if src == "diary":
        tagsStr = ""
        tags = f[6].split(", ")
        # sanitize tags, since f[6] will be "tag1, tag2, ..., tag3". Need to
        # remove first and last quote
        for tag in tags:
          tagsStr += (", " if tagsStr else "") + "\"{0}\"".format(tag)
        json += "{{\"watched\" : \"{0}\", \"title\" : \"{1}\", \"year\": {2}, \"runtime\" : {3}, \"rating\" : \"{4}\", \"tags\" : [{5}], \"lbLink\": \"{6}\", \"id\" : {7}, \"poster\" : \"{8}\", \"backdrop\" : \"{9}\"}}{10}".format(\
                                                                                                                                                                                   f[7], f[1], f[2], f[0][3], f[4][0], tagsStr, f[3], f[0][0] if f[0][0] else -1, f[0][-2], f[0][-1], "," if i < len(films) - 1 else "")
      else:
        json += "{{\"watched\" : \"{0}\", \"title\" : \"{1}\", \"year\": {2}, \"runtime\" : {3}, \"rating\" : \"{4}\", \"tags\" : [{5}], \"lbLink\": \"{6}\", \"id\" : {7}, \"poster\" : \"{8}\", \"backdrop\" : \"{9}\"}}{10}".format(\
                                                                                                                                                                                 "", f[1], f[2], f[0][3], "", "", f[3], f[0][0] if f[0][0] else -1, f[0][-2], f[0][-1], "," if i < len(films) - 1 else "")

    json += "]}"

  return json

func()
