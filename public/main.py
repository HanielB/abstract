from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta

import math, re, argparse, csv, codecs, statistics

import js
from my_js_namespace import x
from my_js_namespace import w

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
  if len(row) == 1:
    return False
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
    entryDate = datetime.strptime(row[7], '%Y-%m-%d')
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
    keep = keep and findInTuples(row[5], director)
  if writer:
    keep = keep and findInTuples(row[6], writer)
  if actor:
    found = False
    if not credited:
      found = findInTuples(row[7], actor)
    else:
      entries = row[7].split("), ")
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

def getFilms(filmList, masterList=[], name=None, tags=None, fyear=None, \
             date=None, rating=None, director=None, writer=None, actor=None, \
             genre=None, runtime=None, credited=False, sort="watched"):
    # filter by info already in films file
    films = list(filter(lambda x: \
                        filterDiary(x, name, tags, fyear, date, rating), \
                        filmList))
    if not films:
      return []
    # maybe filter by master info
    # masterFiltered = list(filter(lambda x: \
    #                              filterMaster(x, director, writer, actor, \
    #                                           genre, runtime, credited), masterList)) \
    #                                           if (director or writer or actor \
    #                                               or genre or runtime) \
    #                                           else masterList
    # films = [[matched[0]] + f[1:] for f in films \
    #          if (matched := list(filter(lambda x : x[1].lower() == f[1].lower() and x[2] == f[2], masterFiltered))) \
    #          and len(matched) == 1]

    if sort == "watched":
      # already sorted but in reverse order
      films = films[::-1]
    elif sort == "rating":
      films = sorted(films, key = lambda x : float(x[4])*2 + \
                     (0.75 if "high" in x[6] else 0.25 if "low" in x[6] \
                      else 0.5) \
                     if x[4] else 0, reverse=True)
    elif sort == "year":
      films = sorted(films, key = lambda x : int(x[0][2]), reverse=True)
    elif sort == "runtime":
      films = sorted(films, key = lambda x : int(x[0][3]) if int(x[0][3]) > 0 else 10000)
    return films

def func():
    # return 5 + 7
    # films = getFilms(w, name="loving")
    films = getFilms(w)

    js.y = len(films)
    js.z = films[0]

    res = [str(f[0]) for f in films]

    # return str(datetime.strptime("2021-03-12", "%Y-%m-%d") + relativedelta(day=31))
    # return str(films)
    return res

func()
