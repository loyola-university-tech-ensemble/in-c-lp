OUT_DIR='../svgs/'

# Make output directory?
if [ ! -d $OUT_DIR ]; then
  mkdir -p $OUT_DIR
fi

# Generate SVGs in output directory
for f in *.ly; do
  [ -f "$f" ] || break
  lilypond --loglevel=BASIC_PROGRESS --output=$OUT_DIR -dpoint-and-click='#f' -dno-print-pages -dpreview -dbackend=svg $f
done

# Strip *preview* from resulting filenames
cd $OUT_DIR
for f in *.svg; do
  [ -f "$f" ] || break
  mv $f "`echo $f | sed 's/preview\.//'`"
done
