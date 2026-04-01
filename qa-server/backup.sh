#!/bin/bash

BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

if [ -f "questions.json" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp questions.json "$BACKUP_DIR/questions_$TIMESTAMP.json"
    echo "✅ Backup created: $BACKUP_DIR/questions_$TIMESTAMP.json"
    
    # Keep only last 10 backups
    ls -t $BACKUP_DIR/questions_*.json | tail -n +11 | xargs rm -f 2>/dev/null
else
    echo "❌ No questions.json found"
fi
